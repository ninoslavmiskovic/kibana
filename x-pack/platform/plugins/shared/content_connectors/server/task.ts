/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Logger, CoreSetup, StartServicesAccessor } from '@kbn/core/server';

import type {
  ConcreteTaskInstance,
  TaskManagerStartContract,
  TaskInstance,
} from '@kbn/task-manager-plugin/server';

import type {
  SearchConnectorsPluginStartDependencies,
  SearchConnectorsPluginSetupDependencies,
} from './types';
import { getConnectorsToDeploy, getPoliciesToDelete } from './services';

import { SearchConnectorsConfig } from './config';
import { AgentlessConnectorsInfraServiceFactory } from './services/infra_service_factory';

const AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_ID = 'search:agentless-connectors-manager-task';
const AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_TYPE = 'search:agentless-connectors-manager';

const SCHEDULE = { interval: '1m' };

export function infraSyncTaskRunner(
  logger: Logger,
  getStartServices: StartServicesAccessor<SearchConnectorsPluginStartDependencies, unknown>,
  agentlessConnectorsInfraServiceFactory: AgentlessConnectorsInfraServiceFactory
) {
  return ({ taskInstance }: { taskInstance: ConcreteTaskInstance }) => {
    return {
      run: async () => {
        try {
          const service =
            agentlessConnectorsInfraServiceFactory.getAgentlessConnectorsInfraService();

          if (!service) {
            logger.warn('Agentless connectors infra service not initialized');
            return {
              state: {},
              schedule: SCHEDULE,
            };
          }
          // We fetch some info even if license does not permit actual operations.
          // This is done so that we could give a warning to the user only
          // if they are actually using the feature.
          logger.debug('Checking state of connectors and agentless policies');

          // Fetch connectors
          const nativeConnectors = await service.getNativeConnectors();

          const policiesMetadata = await service.getConnectorPackagePolicies();

          // Check license if any native connectors or agentless policies found
          if (nativeConnectors.length > 0 || policiesMetadata.length > 0) {
            const [_core, start] = await getStartServices();

            const license = await start.licensing.getLicense();

            if (license.check('fleet', 'platinum').state !== 'valid') {
              logger.warn(
                'Current license is not compatible with agentless connectors. Please upgrade the license to at least platinum'
              );
              return;
            }
          }

          // Deploy Policies
          const connectorsToDeploy = getConnectorsToDeploy(policiesMetadata, nativeConnectors);

          let agentlessConnectorsDeployed = 0;
          for (const connectorMetadata of connectorsToDeploy) {
            // We try-catch to still be able to deploy other connectors if some fail
            try {
              await service.deployConnector(connectorMetadata);

              agentlessConnectorsDeployed += 1;
            } catch (e) {
              logger.warn(
                `Error creating an agentless deployment for connector ${connectorMetadata.id}: ${e.message}`
              );
            }
          }

          // Delete policies
          const policiesToDelete = getPoliciesToDelete(policiesMetadata, nativeConnectors);
          let agentlessConnectorsRemoved = 0;

          for (const policyMetadata of policiesToDelete) {
            // We try-catch to still be able to deploy other connectors if some fail
            try {
              await service.removeDeployment(policyMetadata.package_policy_id);

              agentlessConnectorsRemoved += 1;
            } catch (e) {
              logger.warn(
                `Error when deleting a package policy ${policyMetadata.package_policy_id}: ${e.message}`
              );
            }
          }
          return {
            state: {},
            schedule: SCHEDULE,
          };
        } catch (e) {
          logger.warn(`Error executing agentless deployment sync task: ${e.message}`);
          return {
            state: {},
            schedule: SCHEDULE,
          };
        }
      },
      cancel: async () => {
        logger.warn('timed out');
      },
    };
  };
}

export class AgentlessConnectorDeploymentsSyncService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
  public registerInfraSyncTask(
    core: CoreSetup<SearchConnectorsPluginStartDependencies>,
    plugins: SearchConnectorsPluginSetupDependencies,
    agentlessConnectorsInfraServiceFactory: AgentlessConnectorsInfraServiceFactory
  ) {
    plugins.taskManager.registerTaskDefinitions({
      [AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_TYPE]: {
        title: 'Agentless Connector Deployment Manager',
        description:
          'This task peridocally checks native connectors, agent policies and syncs them if they are out of sync',
        timeout: '1m',
        maxAttempts: 3,
        createTaskRunner: infraSyncTaskRunner(
          this.logger,
          core.getStartServices,
          agentlessConnectorsInfraServiceFactory
        ),
      },
    });
  }

  public async scheduleInfraSyncTask(
    config: SearchConnectorsConfig,
    taskManager: TaskManagerStartContract
  ): Promise<TaskInstance | null> {
    this.logger.info(`Scheduling ${AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_ID}`);
    try {
      const taskInstance = await taskManager.ensureScheduled({
        id: AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_ID,
        taskType: AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_TYPE,
        schedule: SCHEDULE,
        params: {},
        state: {},
        scope: ['search', 'connectors'],
      });

      this.logger.info(
        `Scheduled ${AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_ID} with interval ${taskInstance.schedule?.interval}`
      );

      return taskInstance;
    } catch (e) {
      this.logger.error(
        `Error scheduling ${AGENTLESS_CONNECTOR_DEPLOYMENTS_SYNC_TASK_ID}, received ${e.message}`
      );
      return null;
    }
  }
}
