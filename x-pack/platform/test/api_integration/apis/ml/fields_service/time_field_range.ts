/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../../ftr_provider_context';
import { USER } from '../../../services/ml/security_common';
import { getCommonRequestHeader } from '../../../services/ml/common_api';

export default ({ getService }: FtrProviderContext) => {
  const esArchiver = getService('esArchiver');
  const supertest = getService('supertestWithoutAuth');
  const ml = getService('ml');

  const testDataList = [
    {
      testTitle: 'returns expected time range with index and match_all query',
      user: USER.ML_POWERUSER,
      requestBody: {
        index: 'ft_ecommerce',
        query: { bool: { must: [{ match_all: {} }] } },
        timeFieldName: 'order_date',
      },
      expected: {
        responseCode: 200,
        responseBody: {
          start: 1686528259000,
          end: 1689205536000,
          success: true,
        },
      },
    },
    {
      testTitle: 'returns expected time range with index and query',
      user: USER.ML_POWERUSER,
      requestBody: {
        index: 'ft_ecommerce',
        query: {
          term: {
            'customer_first_name.keyword': {
              value: 'Brigitte',
            },
          },
        },
        timeFieldName: 'order_date',
      },
      expected: {
        responseCode: 200,
        responseBody: {
          start: 1686529382000,
          end: 1689204154000,
          success: true,
        },
      },
    },
    {
      testTitle: 'returns error for index which does not exist',
      user: USER.ML_POWERUSER,
      requestBody: {
        index: 'ft_ecommerce_not_exist',
        query: { bool: { must: [{ match_all: {} }] } },
        timeFieldName: 'order_date',
      },
      expected: {
        responseCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'index_not_found_exception',
        },
      },
    },
  ];

  describe('time_field_range', function () {
    before(async () => {
      await esArchiver.loadIfNeeded('x-pack/platform/test/fixtures/es_archives/ml/ecommerce');
      await ml.testResources.setKibanaTimeZoneToUTC();
    });

    for (const testData of testDataList) {
      it(`${testData.testTitle}`, async () => {
        const { body, status } = await supertest
          .post('/internal/ml/fields_service/time_field_range')
          .auth(testData.user, ml.securityCommon.getPasswordForUser(testData.user))
          .set(getCommonRequestHeader('1'))
          .send(testData.requestBody);
        ml.api.assertResponseStatusCode(testData.expected.responseCode, status, body);

        if (body.error === undefined) {
          expect(body).to.eql(testData.expected.responseBody);
        } else {
          expect(body.error).to.eql(testData.expected.responseBody.error);
          expect(body.message).to.contain(testData.expected.responseBody.message);
        }
      });
    }
  });
};
