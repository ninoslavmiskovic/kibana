/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem, EuiSuperDatePicker, EuiText } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import React from 'react';
import { UI_SETTINGS } from '@kbn/data-plugin/public';
import type {
  MetricsExplorerMetric,
  MetricsExplorerAggregation,
} from '../../../../../common/http_api/metrics_explorer';
import type {
  MetricsExplorerOptions,
  MetricsExplorerTimeOptions,
  MetricsExplorerChartOptions,
} from '../hooks/use_metrics_explorer_options';
import { MetricsExplorerKueryBar } from './kuery_bar';
import { MetricsExplorerMetrics } from './metrics';
import { MetricsExplorerGroupBy } from './group_by';
import { MetricsExplorerAggregationPicker } from './aggregation';
import { MetricsExplorerChartOptions as MetricsExplorerChartOptionsComponent } from './chart_options';
import { useKibanaUiSetting } from '../../../../hooks/use_kibana_ui_setting';
import { mapKibanaQuickRangesToDatePickerRanges } from '../../../../utils/map_timepicker_quickranges_to_datepicker_ranges';

interface Props {
  timeRange: MetricsExplorerTimeOptions;
  options: MetricsExplorerOptions;
  chartOptions: MetricsExplorerChartOptions;
  onRefresh: () => void;
  onTimeChange: (start: string, end: string) => void;
  onGroupByChange: (groupBy: string | null | string[]) => void;
  onFilterQuerySubmit: (query: string) => void;
  onMetricsChange: (metrics: MetricsExplorerMetric[]) => void;
  onAggregationChange: (aggregation: MetricsExplorerAggregation) => void;
  onChartOptionsChange: (chartOptions: MetricsExplorerChartOptions) => void;
}

export const MetricsExplorerToolbar = ({
  timeRange,
  options,
  onTimeChange,
  onRefresh,
  onGroupByChange,
  onFilterQuerySubmit,
  onMetricsChange,
  onAggregationChange,
  chartOptions,
  onChartOptionsChange,
}: Props) => {
  const isDefaultOptions = options.aggregation === 'avg' && options.metrics.length === 0;
  const [timepickerQuickRanges] = useKibanaUiSetting(UI_SETTINGS.TIMEPICKER_QUICK_RANGES);
  const commonlyUsedRanges = mapKibanaQuickRangesToDatePickerRanges(timepickerQuickRanges);

  return (
    <EuiFlexGroup gutterSize="m" direction="column">
      <EuiFlexItem>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={options.aggregation === 'count' ? 2 : false}>
            <MetricsExplorerAggregationPicker
              fullWidth
              options={options}
              onChange={onAggregationChange}
            />
          </EuiFlexItem>
          {options.aggregation !== 'count' && (
            <EuiText size="s" color="subdued">
              <FormattedMessage
                id="xpack.infra.metricsExplorer.aggregationLabel"
                defaultMessage="of"
              />
            </EuiText>
          )}
          {options.aggregation !== 'count' && (
            <EuiFlexItem grow={2}>
              <MetricsExplorerMetrics
                autoFocus={isDefaultOptions}
                options={options}
                onChange={onMetricsChange}
              />
            </EuiFlexItem>
          )}
          <EuiText size="s" color="subdued">
            <FormattedMessage
              id="xpack.infra.metricsExplorer.groupByToolbarLabel"
              defaultMessage="graph per"
            />
          </EuiText>
          <EuiFlexItem grow={1}>
            <MetricsExplorerGroupBy onChange={onGroupByChange} options={options} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <MetricsExplorerKueryBar onSubmit={onFilterQuerySubmit} value={options.filterQuery} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <MetricsExplorerChartOptionsComponent
              onChange={onChartOptionsChange}
              chartOptions={chartOptions}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginRight: 5 }}>
            <EuiSuperDatePicker
              start={timeRange.from}
              end={timeRange.to}
              onTimeChange={({ start, end }) => onTimeChange(start, end)}
              onRefresh={onRefresh}
              commonlyUsedRanges={commonlyUsedRanges}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
