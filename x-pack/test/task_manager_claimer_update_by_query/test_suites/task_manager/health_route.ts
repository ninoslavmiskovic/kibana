/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { keyBy, mapValues } from 'lodash';
import { ConcreteTaskInstance } from '@kbn/task-manager-plugin/server';
import { FtrProviderContext } from '../../ftr_provider_context';

interface MonitoringStats {
  last_update: string;
  status: string;
  stats: {
    configuration: {
      timestamp: string;
      value: Record<string, object>;
    };
    workload: {
      timestamp: string;
      value: {
        count: number;
        task_types: Record<string, object>;
        schedule: Array<[string, number]>;
        overdue: number;
        non_recurring: number;
        owner_ids: number;
        estimated_schedule_density: number[];
        capacity_requirements: {
          per_minute: number;
          per_hour: number;
          per_day: number;
        };
      };
    };
    runtime: {
      timestamp: string;
      value: {
        drift: Record<string, object>;
        drift_by_type: Record<string, Record<string, object>>;
        load: Record<string, object>;
        execution: {
          duration: Record<string, Record<string, object>>;
          persistence: Record<string, number>;
          result_frequency_percent_as_number: Record<string, Record<string, object>>;
        };
        polling: {
          last_successful_poll: string;
          last_polling_delay: string;
          duration: Record<string, object>;
          claim_duration: Record<string, object>;
          result_frequency_percent_as_number: Record<string, number>;
        };
      };
    };
    capacity_estimation: {
      timestamp: string;
      value: {
        observed: {
          observed_kibana_instances: number;
          max_throughput_per_minute: number;
          max_throughput_per_minute_per_kibana: number;
          minutes_to_drain_overdue: number;
          avg_required_throughput_per_minute: number;
          avg_required_throughput_per_minute_per_kibana: number;
          avg_recurring_required_throughput_per_minute: number;
          avg_recurring_required_throughput_per_minute_per_kibana: number;
        };
        proposed: {
          min_required_kibana: number;
          avg_recurring_required_throughput_per_minute_per_kibana: number;
          avg_required_throughput_per_minute: number;
          avg_required_throughput_per_minute_per_kibana: number;
        };
      };
    };
  };
}

export default function ({ getService }: FtrProviderContext) {
  const retry = getService('retry');
  const supertest = getService('supertest');

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function getHealthRequest() {
    return supertest.get('/api/task_manager/_health').set('kbn-xsrf', 'foo');
  }

  function getHealth(): Promise<MonitoringStats> {
    return getHealthRequest()
      .expect(200)
      .then((response) => response.body);
  }

  function getHealthForSampleTask(): Promise<MonitoringStats> {
    return retry.try(async () => {
      const health = await getHealth();

      // only return health stats once they contain sampleTask, if requested
      if (health.stats.runtime.value.drift_by_type.sampleTask) {
        return health;
      }

      // if sampleTask is not in the metrics, wait a bit and retry
      await delay(500);
      throw new Error('sampleTask has not yet run');
    });
  }

  function scheduleTask(task: Partial<ConcreteTaskInstance>): Promise<ConcreteTaskInstance> {
    return supertest
      .post('/api/sample_tasks/schedule')
      .set('kbn-xsrf', 'xxx')
      .send({ task })
      .expect(200)
      .then((response: { body: ConcreteTaskInstance }) => response.body);
  }

  const monitoredAggregatedStatsRefreshRate = 5000;

  describe('health', () => {
    afterEach(async () => {
      // clean up after each test
      return await supertest.delete('/api/sample_tasks').set('kbn-xsrf', 'xxx').expect(200);
    });

    it('should return basic configuration of task manager', async () => {
      const health = await getHealth();
      expect(health.status).to.eql('OK');
      expect(health.stats.configuration.value).to.eql({
        poll_interval: 3000,
        monitored_aggregated_stats_refresh_rate: monitoredAggregatedStatsRefreshRate,
        monitored_stats_running_average_window: 50,
        monitored_task_execution_thresholds: {
          custom: {},
          default: {
            error_threshold: 90,
            warn_threshold: 80,
          },
        },
        request_capacity: 1000,
        capacity: {
          config: 10,
          as_workers: 10,
          as_cost: 20,
        },
        claim_strategy: 'update_by_query',
      });
    });

    it('should return the task manager workload', async () => {
      const health = await getHealth();
      const {
        status,
        stats: { workload },
      } = health;

      expect(status).to.eql('OK');

      const sumSampleTaskInWorkload =
        (
          workload.value.task_types as {
            sampleTask?: { count: number };
          }
        ).sampleTask?.count ?? 0;
      const scheduledWorkload = mapValues(
        keyBy(workload.value.schedule as Array<[string, number]>, ([interval, count]) => interval),
        ([, count]) => count
      ) as unknown as { '37m': number | undefined; '37s': number | undefined };

      await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '37s' },
      });

      await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '37m' },
      });

      await retry.try(async () => {
        // workload is configured to refresh every 5s in FTs
        await delay(monitoredAggregatedStatsRefreshRate);

        const workloadAfterScheduling = (await getHealthForSampleTask()).stats.workload.value;

        expect(
          (workloadAfterScheduling.task_types as { sampleTask: { count: number } }).sampleTask.count
        ).to.eql(sumSampleTaskInWorkload + 2);

        const schedulesWorkloadAfterScheduling = mapValues(
          keyBy(
            workloadAfterScheduling.schedule as Array<[string, number]>,
            ([interval]) => interval
          ),
          ([, count]) => count
        ) as unknown as {
          '37m': number;
          '37s': number;
        };
        expect(schedulesWorkloadAfterScheduling['37s']).to.eql(1 + (scheduledWorkload['37s'] ?? 0));
        expect(schedulesWorkloadAfterScheduling['37m']).to.eql(1 + (scheduledWorkload['37m'] ?? 0));
      });
    });

    it('should return a breakdown of idleTasks in the task manager workload', async () => {
      const {
        capacity_estimation: {
          value: { observed, proposed },
        },
      } = (await getHealth()).stats;

      expect(typeof observed.observed_kibana_instances).to.eql('number');
      expect(typeof observed.max_throughput_per_minute).to.eql('number');
      expect(typeof observed.max_throughput_per_minute_per_kibana).to.eql('number');
      expect(typeof observed.minutes_to_drain_overdue).to.eql('number');
      expect(typeof observed.avg_required_throughput_per_minute).to.eql('number');
      expect(typeof observed.avg_required_throughput_per_minute_per_kibana).to.eql('number');
      expect(typeof observed.avg_recurring_required_throughput_per_minute).to.eql('number');
      expect(typeof observed.avg_recurring_required_throughput_per_minute_per_kibana).to.eql(
        'number'
      );

      expect(typeof proposed.min_required_kibana).to.eql('number');
      expect(typeof proposed.avg_recurring_required_throughput_per_minute_per_kibana).to.eql(
        'number'
      );
      expect(typeof proposed.avg_required_throughput_per_minute_per_kibana).to.eql('number');
    });

    it('should return an estimation of task manager capacity as an array', async () => {
      const {
        workload: { value: workload },
      } = (await getHealth()).stats;

      expect(typeof workload.overdue).to.eql('number');

      expect(typeof workload.non_recurring).to.eql('number');

      expect(typeof workload.capacity_requirements.per_minute).to.eql('number');
      expect(typeof workload.capacity_requirements.per_hour).to.eql('number');
      expect(typeof workload.capacity_requirements.per_day).to.eql('number');

      expect(Array.isArray(workload.estimated_schedule_density)).to.eql(true);
    });

    it('should return the task manager runtime stats', async () => {
      await scheduleTask({
        taskType: 'sampleTask',
        schedule: { interval: '5s' },
      });

      const {
        runtime: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          value: { drift, drift_by_type, load, polling, execution },
        },
      } = (await getHealthForSampleTask()).stats;

      expect(isNaN(Date.parse(polling.last_successful_poll as string))).to.eql(false);
      expect(isNaN(Date.parse(polling.last_polling_delay as string))).to.eql(false);
      expect(typeof polling.result_frequency_percent_as_number.NoTasksClaimed).to.eql('number');
      expect(typeof polling.result_frequency_percent_as_number.RanOutOfCapacity).to.eql('number');
      expect(typeof polling.result_frequency_percent_as_number.PoolFilled).to.eql('number');
      expect(typeof polling.result_frequency_percent_as_number.NoAvailableWorkers).to.eql('number');
      expect(typeof polling.result_frequency_percent_as_number.RunningAtCapacity).to.eql('number');
      expect(typeof polling.result_frequency_percent_as_number.Failed).to.eql('number');

      expect(typeof polling.duration.p50).to.eql('number');
      expect(typeof polling.duration.p90).to.eql('number');
      expect(typeof polling.duration.p95).to.eql('number');
      expect(typeof polling.duration.p99).to.eql('number');

      expect(typeof polling.claim_duration.p50).to.eql('number');
      expect(typeof polling.claim_duration.p90).to.eql('number');
      expect(typeof polling.claim_duration.p95).to.eql('number');
      expect(typeof polling.claim_duration.p99).to.eql('number');

      expect(typeof drift.p50).to.eql('number');
      expect(typeof drift.p90).to.eql('number');
      expect(typeof drift.p95).to.eql('number');
      expect(typeof drift.p99).to.eql('number');

      expect(typeof drift_by_type.sampleTask.p50).to.eql('number');
      expect(typeof drift_by_type.sampleTask.p90).to.eql('number');
      expect(typeof drift_by_type.sampleTask.p95).to.eql('number');
      expect(typeof drift_by_type.sampleTask.p99).to.eql('number');

      expect(typeof load.p50).to.eql('number');
      expect(typeof load.p90).to.eql('number');
      expect(typeof load.p95).to.eql('number');
      expect(typeof load.p99).to.eql('number');

      expect(typeof execution.duration.sampleTask.p50).to.eql('number');
      expect(typeof execution.duration.sampleTask.p90).to.eql('number');
      expect(typeof execution.duration.sampleTask.p95).to.eql('number');
      expect(typeof execution.duration.sampleTask.p99).to.eql('number');

      expect(typeof execution.persistence.non_recurring).to.eql('number');
      expect(typeof execution.persistence.recurring).to.eql('number');

      expect(typeof execution.result_frequency_percent_as_number.sampleTask.Success).to.eql(
        'number'
      );
      expect(typeof execution.result_frequency_percent_as_number.sampleTask.RetryScheduled).to.eql(
        'number'
      );
      expect(typeof execution.result_frequency_percent_as_number.sampleTask.Failed).to.eql(
        'number'
      );
    });

    it('should exclude disabled tasks', async () => {
      const interval = '9s';
      await scheduleTask({
        enabled: false,
        taskType: 'taskToDisable',
        schedule: { interval },
      });

      const timestamp = new Date();

      const health = await retry.try(async () => {
        const result = await getHealth();
        expect(new Date(result.stats.runtime.timestamp).getTime()).to.be.greaterThan(
          timestamp.getTime()
        );
        expect(new Date(result.stats.workload.timestamp).getTime()).to.be.greaterThan(
          timestamp.getTime()
        );
        return result;
      });

      expect(health.stats.runtime.value.execution.duration.taskToDisable).to.eql(undefined);
      expect(health.stats.workload.value.task_types.taskToDisable).to.eql(undefined);
      expect(health.stats.workload.value.schedule.find(([val]) => val === interval)).to.eql(
        undefined
      );
    });
  });
}
