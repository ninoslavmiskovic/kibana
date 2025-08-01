/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { JsonObject } from '@kbn/utility-types';

import {
  Direction,
  TimelineEventsQueries,
  TimelineEventsAllStrategyResponse,
} from '@kbn/security-solution-plugin/common/search_strategy';
import TestAgent from 'supertest/lib/agent';
import { SearchService } from '@kbn/ftr-common-functional-services';
import { FtrProviderContextWithSpaces } from '../../../../ftr_provider_context_with_spaces';

import { getFieldsToRequest, getFilterValue } from '../../../utils';

const TO = '3000-01-01T00:00:00.000Z';
const FROM = '2000-01-01T00:00:00.000Z';
// typical values that have to change after an update from "scripts/es_archiver"
const DATA_COUNT = 7;
const HOST_NAME = 'suricata-sensor-amsterdam';
const TOTAL_COUNT = 96;
const EDGE_LENGTH = 25;
const ACTIVE_PAGE = 0;
const PAGE_SIZE = 25;
const LIMITED_PAGE_SIZE = 2;

export default function ({ getService }: FtrProviderContextWithSpaces) {
  const esArchiver = getService('esArchiver');
  const utils = getService('securitySolutionUtils');

  const getPostBody = (): JsonObject => ({
    defaultIndex: ['auditbeat-*'],
    factoryQueryType: TimelineEventsQueries.all,
    entityType: 'events',
    fieldRequested: getFieldsToRequest(),
    fields: [],
    filterQuery: getFilterValue(HOST_NAME, FROM, TO),
    pagination: {
      activePage: 0,
      querySize: 25,
    },
    language: 'kuery',
    sort: [
      {
        field: '@timestamp',
        direction: Direction.desc,
        esTypes: ['date'],
      },
    ],
    timerange: {
      from: FROM,
      to: TO,
      interval: '12h',
    },
  });

  describe('@skipInServerless Timeline', () => {
    let supertest: TestAgent;
    let search: SearchService;

    before(async () => {
      supertest = await utils.createSuperTest();
      search = await utils.createSearch();
      await esArchiver.load('x-pack/platform/test/fixtures/es_archives/auditbeat/hosts');
    });
    after(async () => {
      await esArchiver.unload('x-pack/platform/test/fixtures/es_archives/auditbeat/hosts');
    });

    it('returns Timeline data', async () => {
      const timeline = await search.send<TimelineEventsAllStrategyResponse>({
        supertest,
        options: {
          ...getPostBody(),
        },
        strategy: 'timelineSearchStrategy',
      });
      expect(timeline.edges.length).to.be(EDGE_LENGTH);
      expect(timeline.edges[0].node.data.length).to.be(DATA_COUNT);
      expect(timeline.totalCount).to.be(TOTAL_COUNT);
      expect(timeline.pageInfo.activePage).to.equal(ACTIVE_PAGE);
      expect(timeline.pageInfo.querySize).to.equal(PAGE_SIZE);
    });

    it('returns paginated Timeline query', async () => {
      const timeline = await search.send<TimelineEventsAllStrategyResponse>({
        supertest,
        options: {
          ...getPostBody(),
          pagination: {
            activePage: 0,
            querySize: LIMITED_PAGE_SIZE,
          },
        },
        strategy: 'timelineSearchStrategy',
      });
      expect(timeline.edges.length).to.be(LIMITED_PAGE_SIZE);
      expect(timeline.edges[0].node.data.length).to.be(DATA_COUNT);
      expect(timeline.totalCount).to.be(TOTAL_COUNT);
      expect(timeline.edges[0].node.data.length).to.be(DATA_COUNT);
      expect(timeline.edges[0]!.node.ecs.host!.name).to.eql([HOST_NAME]);
    });
  });
}
