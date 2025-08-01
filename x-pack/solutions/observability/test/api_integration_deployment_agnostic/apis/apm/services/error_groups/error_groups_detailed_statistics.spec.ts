/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { first, last, sumBy } from 'lodash';
import moment from 'moment';
import { isFiniteNumber } from '@kbn/apm-plugin/common/utils/is_finite_number';
import {
  APIClientRequestParamsOf,
  APIReturnType,
} from '@kbn/apm-plugin/public/services/rest/create_call_apm_api';
import { RecursivePartial } from '@kbn/apm-plugin/typings/common';
import type { ApmSynthtraceEsClient } from '@kbn/apm-synthtrace';
import type { DeploymentAgnosticFtrProviderContext } from '../../../../ftr_provider_context';
import { config, generateData } from './generate_data';
import { getErrorGroupIds } from './get_error_group_ids';

type ErrorGroupsDetailedStatistics =
  APIReturnType<'POST /internal/apm/services/{serviceName}/errors/groups/detailed_statistics'>;

export default function ApiTest({ getService }: DeploymentAgnosticFtrProviderContext) {
  const apmApiClient = getService('apmApi');
  const synthtrace = getService('synthtrace');

  const serviceName = 'synth-go';
  const start = new Date('2021-01-01T00:00:00.000Z').getTime();
  const end = new Date('2021-01-01T00:15:00.000Z').getTime() - 1;

  async function callApi(
    overrides?: RecursivePartial<
      APIClientRequestParamsOf<'POST /internal/apm/services/{serviceName}/errors/groups/detailed_statistics'>['params']
    >
  ) {
    return await apmApiClient.readUser({
      endpoint: `POST /internal/apm/services/{serviceName}/errors/groups/detailed_statistics`,
      params: {
        path: { serviceName, ...overrides?.path },
        query: {
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          numBuckets: 20,
          environment: 'ENVIRONMENT_ALL',
          kuery: '',
          ...overrides?.query,
        },
        body: { groupIds: JSON.stringify(['foo']), ...overrides?.body },
      },
    });
  }

  describe('Error groups detailed statistics', () => {
    describe('when data is not loaded', () => {
      it('handles empty state', async () => {
        const response = await callApi();
        expect(response.status).to.be(200);
        expect(response.body).to.be.eql({ currentPeriod: {}, previousPeriod: {} });
      });
    });

    describe('when data is loaded', () => {
      let apmSynthtraceEsClient: ApmSynthtraceEsClient;
      const { PROD_LIST_ERROR_RATE, PROD_ID_ERROR_RATE } = config;
      before(async () => {
        apmSynthtraceEsClient = await synthtrace.createApmSynthtraceEsClient();
        await generateData({ serviceName, start, end, apmSynthtraceEsClient });
      });

      after(() => apmSynthtraceEsClient.clean());

      describe('without data comparison', () => {
        let errorGroupsDetailedStatistics: ErrorGroupsDetailedStatistics;
        let errorIds: string[] = [];
        before(async () => {
          errorIds = await getErrorGroupIds({ serviceName, start, end, apmApiClient });
          const response = await callApi({
            body: {
              groupIds: JSON.stringify(errorIds),
            },
          });
          errorGroupsDetailedStatistics = response.body;
        });

        it('return detailed statistics for all errors found', () => {
          expect(Object.keys(errorGroupsDetailedStatistics.currentPeriod).sort()).to.eql(errorIds);
        });

        it('returns correct number of occurrencies', () => {
          const numberOfBuckets = 15;
          const detailedStatisticsOccurrenciesSum = Object.values(
            errorGroupsDetailedStatistics.currentPeriod
          )
            .sort()
            .map(({ timeseries }) => {
              return sumBy(timeseries, 'y');
            });

          expect(detailedStatisticsOccurrenciesSum).to.eql([
            PROD_ID_ERROR_RATE * numberOfBuckets,
            PROD_LIST_ERROR_RATE * numberOfBuckets,
          ]);
        });
      });

      describe('return empty state when invalid group id', () => {
        let errorGroupsDetailedStatistics: ErrorGroupsDetailedStatistics;
        before(async () => {
          const response = await callApi({
            body: {
              groupIds: JSON.stringify(['foo']),
            },
          });
          errorGroupsDetailedStatistics = response.body;
        });

        it('returns empty state', () => {
          expect(errorGroupsDetailedStatistics).to.be.eql({
            currentPeriod: {},
            previousPeriod: {},
          });
        });
      });

      describe('with comparison', () => {
        let errorGroupsDetailedStatistics: ErrorGroupsDetailedStatistics;
        let errorIds: string[] = [];
        before(async () => {
          errorIds = await getErrorGroupIds({ serviceName, start, end, apmApiClient });
          const response = await callApi({
            query: {
              start: moment(end).subtract(7, 'minutes').toISOString(),
              end: new Date(end).toISOString(),
              offset: '7m',
            },
            body: {
              groupIds: JSON.stringify(errorIds),
            },
          });
          errorGroupsDetailedStatistics = response.body;
        });

        it('returns some data', () => {
          expect(Object.keys(errorGroupsDetailedStatistics.currentPeriod).length).to.be.greaterThan(
            0
          );
          expect(
            Object.keys(errorGroupsDetailedStatistics.previousPeriod).length
          ).to.be.greaterThan(0);

          const hasCurrentPeriodData = Object.values(
            errorGroupsDetailedStatistics.currentPeriod
          )[0].timeseries.some(({ y }) => isFiniteNumber(y));

          const hasPreviousPeriodData = Object.values(
            errorGroupsDetailedStatistics.previousPeriod
          )[0].timeseries.some(({ y }) => isFiniteNumber(y));

          expect(hasCurrentPeriodData).to.equal(true);
          expect(hasPreviousPeriodData).to.equal(true);
        });

        it('has same start time for both periods', () => {
          expect(
            first(Object.values(errorGroupsDetailedStatistics.currentPeriod)[0].timeseries)?.x
          ).to.equal(
            first(Object.values(errorGroupsDetailedStatistics.previousPeriod)[0].timeseries)?.x
          );
        });

        it('has same end time for both periods', () => {
          expect(
            last(Object.values(errorGroupsDetailedStatistics.currentPeriod)[0].timeseries)?.x
          ).to.equal(
            last(Object.values(errorGroupsDetailedStatistics.previousPeriod)[0].timeseries)?.x
          );
        });

        it('returns same number of buckets for both periods', () => {
          expect(
            Object.values(errorGroupsDetailedStatistics.currentPeriod)[0].timeseries.length
          ).to.equal(
            Object.values(errorGroupsDetailedStatistics.previousPeriod)[0].timeseries.length
          );
        });
      });
    });
  });
}
