/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import {
  DEFAULT_SIGNALS_INDEX,
  DETECTION_ENGINE_SIGNALS_FINALIZE_MIGRATION_URL,
  DETECTION_ENGINE_SIGNALS_MIGRATION_URL,
} from '@kbn/security-solution-plugin/common/constants';
import { ROLES } from '@kbn/security-solution-plugin/common/test';
import { SIGNALS_TEMPLATE_VERSION } from '@kbn/security-solution-plugin/server/lib/detection_engine/routes/index/get_signals_template';
import { Signal } from '@kbn/security-solution-plugin/server/lib/detection_engine/rule_types/types';

import {
  deleteMigrations,
  getIndexNameFromLoad,
  waitForIndexToPopulate,
} from '../../../../../utils';
import {
  createAlertsIndex,
  deleteAllAlerts,
} from '../../../../../../../../common/utils/security_solution';
import {
  createUserAndRole,
  deleteUserAndRole,
} from '../../../../../../../../common/services/security_solution';
import { FtrProviderContext } from '../../../../../../../ftr_provider_context';

interface CreateResponse {
  index: string;
  migration_index: string;
  migration_id: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default ({ getService }: FtrProviderContext): void => {
  const es = getService('es');
  const esArchiver = getService('esArchiver');
  const kbnClient = getService('kibanaServer');
  const supertest = getService('supertest');
  const supertestWithoutAuth = getService('supertestWithoutAuth');
  const log = getService('log');

  describe('@ess Creating signals migrations', () => {
    let createdMigrations: CreateResponse[];
    let legacySignalsIndexName: string;
    let outdatedSignalsIndexName: string;

    beforeEach(async () => {
      createdMigrations = [];

      legacySignalsIndexName = getIndexNameFromLoad(
        await esArchiver.load(
          'x-pack/solutions/security/test/fixtures/es_archives/signals/legacy_signals_index'
        )
      );
      outdatedSignalsIndexName = getIndexNameFromLoad(
        await esArchiver.load(
          'x-pack/solutions/security/test/fixtures/es_archives/signals/outdated_signals_index'
        )
      );
      await createAlertsIndex(supertest, log);
    });

    afterEach(async () => {
      // Finalize the migration after each test so that the .siem-signals alias gets added to the migrated index -
      // this allows deleteSignalsIndex to find and delete the migrated index
      await sleep(5000); // Allow the migration to complete

      if (createdMigrations.length > 0) {
        await supertest
          .post(DETECTION_ENGINE_SIGNALS_FINALIZE_MIGRATION_URL)
          .set('kbn-xsrf', 'true')
          .send({ migration_ids: createdMigrations.map((m) => m.migration_id) })
          .expect(200);
      }

      await esArchiver.unload(
        'x-pack/solutions/security/test/fixtures/es_archives/signals/outdated_signals_index'
      );
      await esArchiver.unload(
        'x-pack/solutions/security/test/fixtures/es_archives/signals/legacy_signals_index'
      );
      await deleteMigrations({
        kbnClient,
        ids: createdMigrations.filter((m) => m?.migration_id).map((m) => m.migration_id),
      });
      await deleteAllAlerts(supertest, log, es);
    });

    it('returns the information necessary to finalize the migration', async () => {
      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [legacySignalsIndexName] })
        .expect(200);
      createdMigrations = [...createdMigrations, ...body.indices];

      expect(body.indices).length(1);
      const [createdMigration] = body.indices;

      expect(createdMigration.index).to.eql(legacySignalsIndexName);
      expect(createdMigration.migration_id).to.be.a('string');
      expect(createdMigration.migration_id.length).to.be.greaterThan(0);
      expect(createdMigration.migration_index).not.to.eql(legacySignalsIndexName);
      expect(createdMigration.migration_index).to.contain(legacySignalsIndexName);
    });

    it('creates a new index containing migrated signals', async () => {
      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [legacySignalsIndexName, outdatedSignalsIndexName] })
        .expect(200);
      createdMigrations = [...createdMigrations, ...body.indices];
      const createResponses: CreateResponse[] = body.indices;

      expect(createResponses).length(2);
      createResponses.forEach((response) => expect(response.migration_id).to.be.a('string'));

      const [{ migration_index: newIndex }] = createResponses;
      await waitForIndexToPopulate(es, log, newIndex);
      const migrationResults = await es.search<{ signal: Signal }>({ index: newIndex });

      expect(migrationResults.hits.hits).length(1);
      const migratedSignal = migrationResults.hits.hits[0]._source?.signal;
      expect(migratedSignal?._meta?.version).to.equal(SIGNALS_TEMPLATE_VERSION);
    });

    it('specifying the signals alias itself is a bad request', async () => {
      const signalsAlias = `${DEFAULT_SIGNALS_INDEX}-default`;

      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [signalsAlias, legacySignalsIndexName] })
        .expect(400);

      expect(body).to.eql({
        message:
          'The following indices are not signals indices and cannot be migrated: [.siem-signals-default].',
        status_code: 400,
      });
    });

    it('rejects extant non-signals indexes', async () => {
      const unrelatedIndex = '.tasks';
      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [legacySignalsIndexName, unrelatedIndex] })
        .expect(400);

      expect(body).to.eql({
        message: 'The following indices are not signals indices and cannot be migrated: [.tasks].',
        status_code: 400,
      });
    });

    it('rejects if an unknown index is specified', async () => {
      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: ['random-index', outdatedSignalsIndexName] })
        .expect(400);

      expect(body).to.eql({
        message:
          'The following indices are not signals indices and cannot be migrated: [random-index].',
        status_code: 400,
      });
    });

    it('returns an inline error on a duplicated request as the destination index already exists', async () => {
      const { body } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [legacySignalsIndexName] })
        .expect(200);
      createdMigrations = [...createdMigrations, ...body.indices];

      const { body: duplicatedBody } = await supertest
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .send({ index: [legacySignalsIndexName] })
        .expect(200);

      const [{ error, ...info }] = duplicatedBody.indices;
      expect(info).to.eql({
        index: legacySignalsIndexName,
        migration_index: null,
        migration_id: null,
      });
      expect(error.status_code).to.eql(400);
      expect(error.message).to.contain('resource_already_exists_exception');
    });

    it('rejects the request if the user does not have sufficient privileges', async () => {
      await createUserAndRole(getService, ROLES.t1_analyst);

      await supertestWithoutAuth
        .post(DETECTION_ENGINE_SIGNALS_MIGRATION_URL)
        .set('kbn-xsrf', 'true')
        .auth(ROLES.t1_analyst, 'changeme')
        .send({ index: [legacySignalsIndexName] })
        .expect(400);

      await deleteUserAndRole(getService, ROLES.t1_analyst);
    });
  });
};
