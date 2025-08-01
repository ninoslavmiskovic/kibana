/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { APIReturnType } from '@kbn/apm-plugin/public/services/rest/create_call_apm_api';
import expect from '@kbn/expect';
import type { ApmSynthtraceEsClient } from '@kbn/apm-synthtrace';
import { config, expectedValues, generateData } from './generate_data';
import { DeploymentAgnosticFtrProviderContext } from '../../../../ftr_provider_context';

export default function ApiTest({ getService }: DeploymentAgnosticFtrProviderContext) {
  const apmApiClient = getService('apmApi');
  const synthtrace = getService('synthtrace');

  const start = new Date('2021-01-01T00:00:00.000Z').getTime();
  const end = new Date('2021-01-01T00:15:00.000Z').getTime() - 1;
  async function callApi(serviceName: string, serverlessId?: string) {
    return await apmApiClient.readUser({
      endpoint: `GET /internal/apm/services/{serviceName}/metrics/serverless/summary`,
      params: {
        path: { serviceName },
        query: {
          environment: 'test',
          kuery: '',
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          ...(serverlessId ? { serverlessId } : {}),
        },
      },
    });
  }

  describe('Serverless overview', () => {
    describe('when data is not loaded', () => {
      let serverlessSummary: APIReturnType<'GET /internal/apm/services/{serviceName}/metrics/serverless/summary'>;
      before(async () => {
        const response = await callApi('lambda-python');
        serverlessSummary = response.body;
      });

      it('returns empty', () => {
        expect(serverlessSummary).to.be.empty();
      });
    });

    describe('when data is loaded', () => {
      const { billedDurationMs, pythonServerlessFunctionNames, faasDuration, serverlessId } =
        config;
      const { expectedMemoryUsedRate } = expectedValues;
      let apmSynthtraceEsClient: ApmSynthtraceEsClient;

      before(async () => {
        apmSynthtraceEsClient = await synthtrace.createApmSynthtraceEsClient();
        await generateData({ start, end, apmSynthtraceEsClient });
      });

      after(() => apmSynthtraceEsClient.clean());

      describe('Python service', () => {
        let serverlessSummary: APIReturnType<'GET /internal/apm/services/{serviceName}/metrics/serverless/summary'>;
        before(async () => {
          const response = await callApi('lambda-python');
          serverlessSummary = response.body;
        });

        it('returns correct memory avg', () => {
          expect(serverlessSummary.memoryUsageAvgRate).to.eql(expectedMemoryUsedRate);
        });
        it('returns correct serverless function total', () => {
          expect(serverlessSummary.serverlessFunctionsTotal).to.eql(
            pythonServerlessFunctionNames.length
          );
        });
        it('returns correct serverless duration avg', () => {
          expect(serverlessSummary.serverlessDurationAvg).to.eql(faasDuration);
        });
        it('returns correct billed duration avg', () => {
          expect(serverlessSummary.billedDurationAvg).to.eql(billedDurationMs);
        });
      });

      describe('detailed metrics', () => {
        let serverlessSummary: APIReturnType<'GET /internal/apm/services/{serviceName}/metrics/serverless/summary'>;
        before(async () => {
          const response = await callApi(
            'lambda-python',
            `${serverlessId}${pythonServerlessFunctionNames[0]}`
          );
          serverlessSummary = response.body;
        });

        it('returns correct memory avg', () => {
          expect(serverlessSummary.memoryUsageAvgRate).to.eql(expectedMemoryUsedRate);
        });
        it('returns correct serverless function total', () => {
          expect(serverlessSummary.serverlessFunctionsTotal).to.eql(1);
        });
        it('returns correct serverless duration avg', () => {
          expect(serverlessSummary.serverlessDurationAvg).to.eql(faasDuration);
        });
        it('returns correct billed duration avg', () => {
          expect(serverlessSummary.billedDurationAvg).to.eql(billedDurationMs);
        });
      });
    });
  });
}
