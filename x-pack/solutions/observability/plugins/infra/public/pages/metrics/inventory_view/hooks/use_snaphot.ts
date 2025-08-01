/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useMemo } from 'react';
import { decodeOrThrow } from '@kbn/io-ts-utils';
import { DataSchemaFormat } from '@kbn/metrics-data-access-plugin/common';
import { usePluginConfig } from '../../../../containers/plugin_config_context';
import { isPending, useFetcher } from '../../../../hooks/use_fetcher';
import type {
  InfraTimerangeInput,
  SnapshotRequest,
} from '../../../../../common/http_api/snapshot_api';
import { SnapshotNodeResponseRT } from '../../../../../common/http_api/snapshot_api';

export interface UseSnapshotRequest
  extends Omit<SnapshotRequest, 'filterQuery' | 'timerange' | 'includeTimeseries'> {
  filterQuery?: string | null | symbol;
  currentTime: number;
  includeTimeseries?: boolean;
  timerange?: InfraTimerangeInput;
}

export function useSnapshot(
  props: Omit<UseSnapshotRequest, 'schema'>,
  { sendRequestImmediately = true }: { sendRequestImmediately?: boolean } = {}
) {
  const config = usePluginConfig();

  const payload = useMemo(
    () =>
      // TODO: Replace this with the schema selector value
      JSON.stringify(
        buildPayload({
          ...props,
          schema: config.featureFlags.hostOtelEnabled
            ? DataSchemaFormat.SEMCONV
            : DataSchemaFormat.ECS,
        })
      ),
    [props, config.featureFlags.hostOtelEnabled]
  );

  const { data, status, error, refetch } = useFetcher(
    async (callApi) => {
      const response = await callApi('/api/metrics/snapshot', {
        method: 'POST',
        body: payload,
      });

      return decodeOrThrow(SnapshotNodeResponseRT)(response);
    },
    [payload],
    {
      autoFetch: sendRequestImmediately,
    }
  );

  return {
    error: (error && error.message) || null,
    loading: isPending(status),
    nodes: data?.nodes || [],
    interval: data?.interval || '60s',
    reload: refetch,
  };
}

const buildPayload = (args: UseSnapshotRequest): SnapshotRequest => {
  const {
    accountId = '',
    currentTime,
    dropPartialBuckets = true,
    filterQuery = '',
    groupBy = null,
    includeTimeseries = true,
    metrics,
    nodeType,
    overrideCompositeSize,
    region = '',
    sourceId,
    timerange,
    schema,
  } = args;

  return {
    accountId,
    dropPartialBuckets,
    filterQuery: filterQuery as string,
    groupBy,
    includeTimeseries,
    metrics,
    nodeType,
    sourceId,
    overrideCompositeSize,
    region,
    schema,
    timerange: timerange ?? {
      interval: '1m',
      to: currentTime,
      from: currentTime - 1200 * 1000,
      lookbackSize: 5,
    },
  };
};
