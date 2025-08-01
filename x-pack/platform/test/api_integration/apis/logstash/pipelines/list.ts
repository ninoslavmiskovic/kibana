/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';
import pipelineList from './fixtures/list.json';

export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');
  // Failing: See https://github.com/elastic/kibana/issues/151350
  describe.skip('list', () => {
    const archive = 'x-pack/platform/test/fixtures/es_archives/logstash/example_pipelines';

    before('load pipelines archive', () => {
      return esArchiver.load(archive);
    });

    after('unload pipelines archive', () => {
      return esArchiver.unload(archive);
    });

    it('should return all the pipelines', async () => {
      const { body } = await supertest.get('/api/logstash/pipelines').expect(200);

      expect(body).to.eql(pipelineList);
    });
  });
}
