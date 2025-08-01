/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isEmpty, partition } from 'lodash';
import type { ActionsClient } from '@kbn/actions-plugin/server';
import type {
  BulkActionEditType,
  NormalizedRuleAction,
  ThrottleForBulkActions,
  BulkActionEditPayload,
} from '../../../../../../common/api/detection_engine/rule_management';
import { BulkActionEditTypeEnum } from '../../../../../../common/api/detection_engine/rule_management';
import { transformToActionFrequency } from '../../normalization/rule_actions';
import { transformNormalizedRuleToAlertAction } from '../../../../../../common/detection_engine/transform_actions';

/**
 * helper utility that defines whether bulk edit action is related to index patterns, i.e. one of:
 * 'add_index_patterns', 'delete_index_patterns', 'set_index_patterns'
 * @param editAction {@link BulkActionEditType}
 * @returns {boolean}
 */
export const isIndexPatternsBulkEditAction = (editAction: BulkActionEditType) => {
  const indexPatternsActions: BulkActionEditType[] = [
    BulkActionEditTypeEnum.add_index_patterns,
    BulkActionEditTypeEnum.delete_index_patterns,
    BulkActionEditTypeEnum.set_index_patterns,
  ];
  return indexPatternsActions.includes(editAction);
};

/**
 * helper utility that defines whether bulk edit action is related to alert suppression, i.e. one of:
 * 'set_alert_suppression_for_threshold', 'delete_alert_suppression', 'set_alert_suppression'
 * @param editAction {@link BulkActionEditType}
 * @returns {boolean}
 */
const isAlertSuppressionBulkEditAction = (editAction: BulkActionEditType) => {
  const bulkActions: BulkActionEditType[] = [
    BulkActionEditTypeEnum.set_alert_suppression_for_threshold,
    BulkActionEditTypeEnum.delete_alert_suppression,
    BulkActionEditTypeEnum.set_alert_suppression,
  ];
  return bulkActions.includes(editAction);
};

/**
 * Checks if any of the actions is related to alert suppression, i.e. one of:
 * 'set_alert_suppression_for_threshold', 'delete_alert_suppression', 'set_alert_suppression'
 * @param actions {@link BulkActionEditPayload[][]}
 * @returns {boolean}
 */
export const hasAlertSuppressionBulkEditAction = (actions: BulkActionEditPayload[]): boolean => {
  return actions.some((action) => isAlertSuppressionBulkEditAction(action.type));
};

/**
 * Separates system actions from actions and performs necessary transformations for
 * alerting rules client bulk edit operations.
 * @param actionsClient
 * @param actions
 * @param throttle
 * @returns
 */
export const parseAndTransformRuleActions = (
  actionsClient: ActionsClient,
  actions: NormalizedRuleAction[],
  throttle: ThrottleForBulkActions | undefined
) => {
  const [systemActions, extActions] = !isEmpty(actions)
    ? partition(actions, (action: NormalizedRuleAction) => actionsClient.isSystemAction(action.id))
    : [[], actions];
  return [
    ...(systemActions ?? []),
    ...transformToActionFrequency(extActions ?? [], throttle).map(
      transformNormalizedRuleToAlertAction
    ),
  ];
};
