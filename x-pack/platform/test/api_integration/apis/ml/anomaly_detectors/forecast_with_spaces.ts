/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { JOB_STATE, DATAFEED_STATE } from '@kbn/ml-plugin/common/constants/states';
import { FtrProviderContext } from '../../../ftr_provider_context';
import { USER } from '../../../services/ml/security_common';
import { getCommonRequestHeader } from '../../../services/ml/common_api';

export default ({ getService }: FtrProviderContext) => {
  const esArchiver = getService('esArchiver');
  const supertest = getService('supertestWithoutAuth');
  const ml = getService('ml');
  const spacesService = getService('spaces');
  const retry = getService('retry');

  const forecastJobId = 'fq_single_forecast';
  const forecastJobDatafeedId = `datafeed-${forecastJobId}`;
  const idSpace1 = 'space1';
  const idSpace2 = 'space2';

  async function runForecast(
    jobId: string,
    space: string,
    duration: string | number,
    user: USER,
    expectedStatusCode: number
  ) {
    const { body, status } = await supertest
      .post(`${space ? `/s/${space}` : ''}/internal/ml/anomaly_detectors/${jobId}/_forecast`)
      .auth(user, ml.securityCommon.getPasswordForUser(user))
      .set(getCommonRequestHeader('1'))
      .send({ duration });
    ml.api.assertResponseStatusCode(expectedStatusCode, status, body);

    return body;
  }

  async function deleteForecast(
    jobId: string,
    forecastId: string,
    space: string,
    user: USER,
    expectedStatusCode: number
  ) {
    await retry.tryForTime(10000, async () => {
      const { body, status } = await supertest
        .delete(
          `${
            space ? `/s/${space}` : ''
          }/internal/ml/anomaly_detectors/${jobId}/_forecast/${forecastId}`
        )
        .auth(user, ml.securityCommon.getPasswordForUser(user))
        .set(getCommonRequestHeader('1'));
      ml.api.assertResponseStatusCode(expectedStatusCode, status, body);

      return body;
    });
  }

  describe('POST anomaly_detectors _forecast with spaces', function () {
    let forecastId: string;
    before(async () => {
      await esArchiver.loadIfNeeded('x-pack/platform/test/fixtures/es_archives/ml/farequote');
      await ml.testResources.setKibanaTimeZoneToUTC();

      await spacesService.create({ id: idSpace1, name: 'space_one', disabledFeatures: [] });
      await spacesService.create({ id: idSpace2, name: 'space_two', disabledFeatures: [] });

      const jobConfig = ml.commonConfig.getADFqSingleMetricJobConfig(forecastJobId);
      const datafeedConfig = ml.commonConfig.getADFqDatafeedConfig(forecastJobId);

      await ml.api.createAnomalyDetectionJob(jobConfig, idSpace1);
      await ml.api.createDatafeed(datafeedConfig, idSpace1);
    });

    after(async () => {
      await ml.api.closeAnomalyDetectionJob(forecastJobId);
      await spacesService.delete(idSpace1);
      await spacesService.delete(idSpace2);
      await ml.api.cleanMlIndices();
      await ml.testResources.cleanMLSavedObjects();
    });

    it('should not forecast for a job that has not been opened', async () => {
      await runForecast(forecastJobId, idSpace1, '1d', USER.ML_POWERUSER, 409);
    });

    it('should not forecast for a job that has not been run', async () => {
      await ml.api.openAnomalyDetectionJob(forecastJobId);
      await runForecast(forecastJobId, idSpace1, '1d', USER.ML_POWERUSER, 400);
    });

    it('should not forecast for a job with an invalid job ID', async () => {
      await runForecast(`${forecastJobId}_invalid`, idSpace1, '1d', USER.ML_POWERUSER, 404);
    });

    it('should run forecast for open job with valid job ID', async () => {
      await ml.api.startDatafeed(forecastJobDatafeedId, { start: '0', end: `${Date.now()}` });
      await ml.api.waitForDatafeedState(forecastJobDatafeedId, DATAFEED_STATE.STOPPED);
      await ml.api.waitForJobState(forecastJobId, JOB_STATE.CLOSED);
      await ml.api.openAnomalyDetectionJob(forecastJobId);
      const resp = await runForecast(forecastJobId, idSpace1, '1d', USER.ML_POWERUSER, 200);
      forecastId = resp.forecast_id;
      await ml.testExecution.logTestStep(
        `forecast results should exist for job '${forecastJobId}'`
      );
      await ml.api.assertForecastResultsExist(forecastJobId);
    });

    it('should not delete forecast for user without permissions', async () => {
      await deleteForecast(forecastJobId, forecastId, idSpace1, USER.ML_VIEWER, 403);
    });

    it('should delete forecast for user with permissions', async () => {
      await deleteForecast(forecastJobId, forecastId, idSpace1, USER.ML_POWERUSER, 200);
    });

    it('should not run forecast for open job with invalid duration', async () => {
      await runForecast(forecastJobId, idSpace1, 3600000, USER.ML_POWERUSER, 400);
    });

    it('should not run forecast for open job with valid job ID as ML Viewer', async () => {
      await runForecast(forecastJobId, idSpace1, '1d', USER.ML_VIEWER, 403);
    });

    it('should not run forecast for open job with valid job ID in wrong space', async () => {
      await runForecast(forecastJobId, idSpace2, '1d', USER.ML_POWERUSER, 404);
    });
  });
};
