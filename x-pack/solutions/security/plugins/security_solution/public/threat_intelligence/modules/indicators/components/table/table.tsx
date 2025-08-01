/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import type { EuiDataGridColumnCellActionProps } from '@elastic/eui';
import {
  EuiDataGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
} from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n-react';
import type {
  EuiDataGridColumn,
  EuiDataGridRowHeightsOptions,
} from '@elastic/eui/src/components/datagrid/data_grid_types';
import { CellActions } from './cell_actions';
import { cellPopoverRendererFactory } from './cell_popover_renderer';
import { cellRendererFactory } from './cell_renderer';
import type { BrowserFields } from '../../../../types';
import type { Indicator } from '../../../../../../common/threat_intelligence/types/indicator';
import { RawIndicatorFieldId } from '../../../../../../common/threat_intelligence/types/indicator';
import { EmptyState } from '../../../../components/empty_state';
import type { IndicatorsTableContextValue } from '../../hooks/use_table_context';
import { IndicatorsTableContext } from '../../hooks/use_table_context';
import { IndicatorsFlyout } from '../flyout/flyout';
import type { ColumnSettingsValue } from '../../hooks/use_column_settings';
import { useToolbarOptions } from '../../hooks/use_toolbar_options';
import { useFieldTypes } from '../../../../hooks/use_field_types';
import { getFieldSchema } from '../../utils/get_field_schema';
import type { Pagination } from '../../services/fetch_indicators';
import { TABLE_TEST_ID, TABLE_UPDATE_PROGRESS_TEST_ID } from './test_ids';
import { useSecurityContext } from '../../../../hooks/use_security_context';

const actionsColumnIconWidth = 28;

export interface IndicatorsTableProps {
  indicators: Indicator[];
  indicatorCount: number;
  pagination: Pagination;
  onChangeItemsPerPage: (value: number) => void;
  onChangePage: (value: number) => void;
  /**
   * If true, no data is available yet
   */
  isLoading?: boolean;
  isFetching?: boolean;
  browserFields: BrowserFields;
  columnSettings: ColumnSettingsValue;
}

const gridStyle = {
  border: 'horizontal',
  header: 'underline',
  cellPadding: 'm',
  fontSize: 's',
} as const;

export const IndicatorsTable: FC<IndicatorsTableProps> = ({
  indicators,
  indicatorCount,
  onChangePage,
  onChangeItemsPerPage,
  pagination,
  isLoading,
  isFetching,
  browserFields,
  columnSettings: { columns, columnVisibility, handleResetColumns, handleToggleColumn, sorting },
}) => {
  const securitySolutionContext = useSecurityContext();

  const [expanded, setExpanded] = useState<Indicator>();

  const fieldTypes = useFieldTypes();

  const renderCellValue = useMemo(
    () => cellRendererFactory(pagination.pageIndex * pagination.pageSize),
    [pagination.pageIndex, pagination.pageSize]
  );

  const renderCellPopoverValue = useMemo(
    () => cellPopoverRendererFactory(indicators, pagination),
    [indicators, pagination]
  );

  const indicatorTableContextValue = useMemo<IndicatorsTableContextValue>(
    () => ({ expanded, setExpanded, indicators }),
    [expanded, indicators]
  );

  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;

  const leadingControlColumns = useMemo(
    () => [
      {
        id: 'Actions',
        width: securitySolutionContext?.hasAccessToTimeline
          ? 3 * actionsColumnIconWidth
          : 2 * actionsColumnIconWidth,
        headerCellRender: () => (
          <FormattedMessage
            id="xpack.securitySolution.threatIntelligence.indicator.table.actionColumnLabel"
            defaultMessage="Actions"
          />
        ),
        rowCellRender: renderCellValue,
      },
    ],
    [renderCellValue, securitySolutionContext?.hasAccessToTimeline]
  );

  const mappedColumns = useMemo(
    () =>
      columns.map((col: EuiDataGridColumn) => {
        return {
          ...col,
          isSortable: col.id !== RawIndicatorFieldId.Id && browserFields[col.id]?.aggregatable,
          schema: getFieldSchema(fieldTypes[col.id]),
          cellActions: [
            ({ rowIndex, columnId, Component }: EuiDataGridColumnCellActionProps) => (
              <CellActions
                rowIndex={rowIndex}
                columnId={columnId}
                Component={Component}
                indicators={indicators}
                pagination={pagination}
              />
            ),
          ],
        };
      }),
    [browserFields, columns, fieldTypes, indicators, pagination]
  );

  const toolbarOptions = useToolbarOptions({
    browserFields,
    start,
    end,
    indicatorCount,
    columns,
    onResetColumns: handleResetColumns,
    onToggleColumn: handleToggleColumn,
  });

  const flyoutFragment = useMemo(
    () =>
      expanded ? (
        <IndicatorsFlyout indicator={expanded} closeFlyout={() => setExpanded(undefined)} />
      ) : null,
    [expanded]
  );

  const gridFragment = useMemo(() => {
    if (isLoading) {
      return (
        <EuiFlexGroup justifyContent="spaceAround">
          <EuiFlexItem grow={false}>
            <EuiPanel hasShadow={false} hasBorder={false} paddingSize="xl">
              <EuiLoadingSpinner size="xl" />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    }

    const rowHeightsOptions: EuiDataGridRowHeightsOptions = {
      lineHeight: '30px',
    };

    if (!indicatorCount) {
      return <EmptyState />;
    }

    return (
      <>
        {isFetching && (
          <EuiProgress
            data-test-subj={TABLE_UPDATE_PROGRESS_TEST_ID}
            size="xs"
            color="accent"
            position="absolute"
          />
        )}
        <EuiSpacer size="xs" />

        <EuiDataGrid
          aria-labelledby="indicators-table"
          leadingControlColumns={leadingControlColumns}
          rowCount={indicatorCount}
          renderCellValue={renderCellValue}
          renderCellPopover={renderCellPopoverValue}
          toolbarVisibility={toolbarOptions}
          pagination={{
            ...pagination,
            onChangeItemsPerPage,
            onChangePage,
          }}
          gridStyle={gridStyle}
          data-test-subj={TABLE_TEST_ID}
          sorting={sorting}
          columnVisibility={columnVisibility}
          columns={mappedColumns}
          rowHeightsOptions={rowHeightsOptions}
        />
      </>
    );
  }, [
    isLoading,
    indicatorCount,
    isFetching,
    leadingControlColumns,
    renderCellValue,
    renderCellPopoverValue,
    toolbarOptions,
    pagination,
    onChangeItemsPerPage,
    onChangePage,
    sorting,
    columnVisibility,
    mappedColumns,
  ]);

  return (
    <IndicatorsTableContext.Provider value={indicatorTableContextValue}>
      <div css={{ position: 'relative' }}>
        {flyoutFragment}
        {gridFragment}
      </div>
    </IndicatorsTableContext.Provider>
  );
};
