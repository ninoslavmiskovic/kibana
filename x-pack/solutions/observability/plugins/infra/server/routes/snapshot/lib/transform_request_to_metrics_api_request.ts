/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  type MetricsAPIMetric,
  type MetricsAPIRequest,
  findInventoryFields,
  findInventoryModel,
} from '@kbn/metrics-data-access-plugin/common';
import type { ESSearchClient } from '@kbn/metrics-data-access-plugin/server';
import { TIMESTAMP_FIELD } from '../../../../common/constants';
import type { SnapshotRequest } from '../../../../common/http_api';
import type { InfraSource } from '../../../lib/sources';
import { createTimeRangeWithInterval } from './create_timerange_with_interval';
import { parseFilterQuery } from '../../../utils/serialized_query';
import { transformSnapshotMetricsToMetricsAPIMetrics } from './transform_snapshot_metrics_to_metrics_api_metrics';
import { META_KEY } from './constants';
import type { SourceOverrides } from './get_nodes';

export const transformRequestToMetricsAPIRequest = async ({
  client,
  source,
  snapshotRequest,
  compositeSize,
  sourceOverrides,
}: {
  client: ESSearchClient;
  source: InfraSource;
  snapshotRequest: SnapshotRequest;
  compositeSize: number;
  sourceOverrides?: SourceOverrides;
}): Promise<MetricsAPIRequest> => {
  const timeRangeWithIntervalApplied = await createTimeRangeWithInterval(client, {
    ...snapshotRequest,
    filterQuery: parseFilterQuery(snapshotRequest.filterQuery),
    sourceConfiguration: source.configuration,
  });

  const transformed = await transformSnapshotMetricsToMetricsAPIMetrics(snapshotRequest);

  const metricsApiRequest: MetricsAPIRequest = {
    indexPattern: sourceOverrides?.indexPattern ?? source.configuration.metricAlias,
    timerange: {
      ...timeRangeWithIntervalApplied,
    },
    metrics: transformed,
    limit: snapshotRequest.overrideCompositeSize
      ? snapshotRequest.overrideCompositeSize
      : compositeSize,
    alignDataToEnd: true,
    dropPartialBuckets: snapshotRequest.dropPartialBuckets ?? true,
    includeTimeseries: snapshotRequest.includeTimeseries,
  };

  const filters = [];
  const parsedFilters = parseFilterQuery(snapshotRequest.filterQuery);
  if (parsedFilters) {
    filters.push(parsedFilters);
  }

  if (snapshotRequest.accountId) {
    filters.push({ term: { 'cloud.account.id': snapshotRequest.accountId } });
  }

  if (snapshotRequest.region) {
    filters.push({ term: { 'cloud.region': snapshotRequest.region } });
  }

  const inventoryModel = findInventoryModel(snapshotRequest.nodeType);
  if (inventoryModel && inventoryModel.nodeFilter) {
    inventoryModel.nodeFilter?.forEach((f) => filters.push(f));
  }

  const inventoryFields = findInventoryFields(snapshotRequest.nodeType);
  if (snapshotRequest.groupBy) {
    const groupBy = snapshotRequest.groupBy.map((g) => g.field).filter(Boolean) as string[];
    metricsApiRequest.groupBy = [...groupBy, inventoryFields.id];
  }

  const topMetricMetrics = [{ field: inventoryFields.name }];
  if (inventoryFields.ip) {
    topMetricMetrics.push({ field: inventoryFields.ip });
  }
  if (inventoryFields.os) {
    topMetricMetrics.push({ field: inventoryFields.os });
  }
  if (inventoryFields.cloudProvider) {
    topMetricMetrics.push({ field: inventoryFields.cloudProvider });
  }

  const metaAggregation: MetricsAPIMetric = {
    id: META_KEY,
    aggregations: {
      [META_KEY]: {
        top_metrics: {
          size: 1,
          metrics: topMetricMetrics,
          sort: {
            [TIMESTAMP_FIELD]: 'desc',
          },
        },
      },
    },
  };

  metricsApiRequest.metrics.push(metaAggregation);

  if (filters.length) {
    metricsApiRequest.filters = filters;
  }

  return metricsApiRequest;
};
