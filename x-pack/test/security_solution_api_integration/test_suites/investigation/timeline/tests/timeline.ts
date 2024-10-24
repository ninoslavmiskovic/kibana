/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { SavedTimeline, TimelineTypeEnum } from '@kbn/security-solution-plugin/common/api/timeline';
import { TIMELINE_URL, TIMELINES_URL } from '@kbn/security-solution-plugin/common/constants';
import TestAgent from 'supertest/lib/agent';
import { FtrProviderContextWithSpaces } from '../../../../ftr_provider_context_with_spaces';
import { createBasicTimeline, createBasicTimelineTemplate } from '../../utils/timelines';

export default function ({ getService }: FtrProviderContextWithSpaces) {
  const utils = getService('securitySolutionUtils');
  const esArchiver = getService('esArchiver');
  let supertest: TestAgent;

  describe('Timeline', () => {
    before(async () => (supertest = await utils.createSuperTest()));

    describe('timelines', () => {
      it('Make sure that we get Timeline data', async () => {
        const titleToSaved = 'hello timeline';
        await createBasicTimeline(supertest, titleToSaved);

        const resp = await supertest.get(TIMELINES_URL).set('kbn-xsrf', 'true');

        const timelines = resp.body.timeline;

        expect(timelines.length).to.greaterThan(0);
      });

      it('Make sure that pagination is working in Timeline query', async () => {
        const titleToSaved = 'hello timeline';
        await createBasicTimeline(supertest, titleToSaved);

        const resp = await supertest
          .get(`${TIMELINES_URL}?page_size=1&page_index=1`)
          .set('kbn-xsrf', 'true');

        const timelines = resp.body.timeline;

        expect(timelines.length).to.equal(1);
      });

      it('Make sure that we get Timeline template data', async () => {
        const titleToSaved = 'hello timeline template';
        await createBasicTimelineTemplate(supertest, titleToSaved);

        const resp = await supertest
          .get(`${TIMELINES_URL}?timeline_type=template`)
          .set('kbn-xsrf', 'true');

        const templates: SavedTimeline[] = resp.body.timeline;

        expect(templates.length).to.greaterThan(0);
        expect(
          templates.filter((t) => t.timelineType === TimelineTypeEnum.default).length
        ).to.equal(0);
      });
    });
    /**
     * Migration of saved object not working to current serverless version
     * https://github.com/elastic/kibana/issues/196483
     * */
    describe.skip('resolve timeline', () => {
      before(async () => {
        await esArchiver.load(
          'x-pack/test/functional/es_archives/security_solution/timelines/7.15.0'
        );
      });

      after(async () => {
        await esArchiver.unload(
          'x-pack/test/functional/es_archives/security_solution/timelines/7.15.0'
        );
      });

      it('should return outcome exactMatch when the id is unchanged', async () => {
        const resp = await supertest
          .get(`${TIMELINE_URL}/resolve`)
          .query({ id: '8dc70950-1012-11ec-9ad3-2d7c6600c0f7' });
        expect(resp.body.data.outcome).to.be('exactMatch');
        expect(resp.body.data.alias_target_id).to.be(undefined);
        expect(resp.body.data.timeline.title).to.be('Awesome Timeline');
      });

      describe('notes', () => {
        it('should return notes with eventId', async () => {
          const resp = await supertest
            .get(`${TIMELINE_URL}/resolve`)
            .query({ id: '6484cc90-126e-11ec-83d2-db1096c73738' });

          expect(resp.body.data.timeline.notes[0].eventId).to.be('Edo00XsBEVtyvU-8LGNe');
        });

        it('should return notes with the timelineId matching request id', async () => {
          const resp = await supertest
            .get(`${TIMELINE_URL}/resolve`)
            .query({ id: '6484cc90-126e-11ec-83d2-db1096c73738' });

          expect(resp.body.data.timeline.notes[0].timelineId).to.be(
            '6484cc90-126e-11ec-83d2-db1096c73738'
          );
          expect(resp.body.data.timeline.notes[1].timelineId).to.be(
            '6484cc90-126e-11ec-83d2-db1096c73738'
          );
        });
      });

      describe('pinned events', () => {
        it('should pinned events with eventId', async () => {
          const resp = await supertest
            .get(`${TIMELINE_URL}/resolve`)
            .query({ id: '6484cc90-126e-11ec-83d2-db1096c73738' });

          expect(resp.body.data.timeline.pinnedEventsSaveObject[0].eventId).to.be(
            'DNo00XsBEVtyvU-8LGNe'
          );
          expect(resp.body.data.timeline.pinnedEventsSaveObject[1].eventId).to.be(
            'Edo00XsBEVtyvU-8LGNe'
          );
        });

        it('should return pinned events with the timelineId matching request id', async () => {
          const resp = await supertest
            .get(`${TIMELINE_URL}/resolve`)
            .query({ id: '6484cc90-126e-11ec-83d2-db1096c73738' });

          expect(resp.body.data.timeline.pinnedEventsSaveObject[0].timelineId).to.be(
            '6484cc90-126e-11ec-83d2-db1096c73738'
          );
          expect(resp.body.data.timeline.pinnedEventsSaveObject[1].timelineId).to.be(
            '6484cc90-126e-11ec-83d2-db1096c73738'
          );
        });
      });
    });
  });
}
