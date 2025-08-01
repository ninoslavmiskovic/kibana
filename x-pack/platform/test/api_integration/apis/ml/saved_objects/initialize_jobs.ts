/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { sortBy } from 'lodash';

import { FtrProviderContext } from '../../../ftr_provider_context';
import { USER } from '../../../services/ml/security_common';
import { getCommonRequestHeader } from '../../../services/ml/common_api';

export default ({ getService }: FtrProviderContext) => {
  const esArchiver = getService('esArchiver');
  const ml = getService('ml');
  const supertest = getService('supertestWithoutAuth');

  const adJobId = 'fq_single';
  const dfaJobId = 'ihp_od';

  async function runRequest(user: USER, expectedStatusCode: number) {
    const { body, status } = await supertest
      .get(`/internal/ml/saved_objects/initialize`)
      .auth(user, ml.securityCommon.getPasswordForUser(user))
      .set(getCommonRequestHeader('1'));
    ml.api.assertResponseStatusCode(expectedStatusCode, status, body);

    return body;
  }

  describe('GET saved_objects/initialize for AD and DFA jobs', () => {
    before(async () => {
      await esArchiver.loadIfNeeded('x-pack/platform/test/fixtures/es_archives/ml/ihp_outlier');

      await ml.api.createAnomalyDetectionJobES(
        ml.commonConfig.getADFqSingleMetricJobConfig(adJobId)
      );
      await ml.api.createDataFrameAnalyticsJobES(
        ml.commonConfig.getDFAIhpOutlierDetectionJobConfig(dfaJobId)
      );

      await ml.testResources.setKibanaTimeZoneToUTC();
    });

    after(async () => {
      await ml.api.cleanMlIndices();
      await ml.testResources.cleanMLSavedObjects();
    });

    it('should initialize jobs with no spaces assigned', async () => {
      await ml.api.assertJobSpaces(adJobId, 'anomaly-detector', []);
      await ml.api.assertJobSpaces(dfaJobId, 'data-frame-analytics', []);

      const body = await runRequest(USER.ML_POWERUSER_ALL_SPACES, 200);

      expect(body).to.have.property('jobs');
      expect(sortBy(body.jobs, 'id')).to.eql([
        { id: adJobId, type: 'anomaly-detector' },
        { id: dfaJobId, type: 'data-frame-analytics' },
      ]);
      expect(body).to.have.property('success', true);
      await ml.api.assertJobSpaces(adJobId, 'anomaly-detector', ['*']);
      await ml.api.assertJobSpaces(dfaJobId, 'data-frame-analytics', ['*']);
    });

    it('should not initialize jobs if all jobs have spaces assigned', async () => {
      const body = await runRequest(USER.ML_POWERUSER_ALL_SPACES, 200);

      expect(body).to.eql({ datafeeds: [], jobs: [], trainedModels: [], success: true });
      await ml.api.assertJobSpaces(adJobId, 'anomaly-detector', ['*']);
      await ml.api.assertJobSpaces(dfaJobId, 'data-frame-analytics', ['*']);
    });
  });
};
