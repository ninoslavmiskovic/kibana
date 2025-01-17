/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import {
  type ActionExecutionContext,
  type Action,
  addPanelMenuTrigger,
} from '@kbn/ui-actions-plugin/public';
import { PresentationContainer } from '@kbn/presentation-containers';
import { ADD_PANEL_OTHER_GROUP } from '@kbn/embeddable-plugin/public';
import type { IconType, CommonProps } from '@elastic/eui';
import React, { type MouseEventHandler } from 'react';

export interface PanelSelectionMenuItem extends Pick<CommonProps, 'data-test-subj'> {
  id: string;
  name: string;
  icon: IconType;
  onClick: MouseEventHandler;
  description?: string;
  isDisabled?: boolean;
  isDeprecated?: boolean;
  order: number;
}

export type GroupedAddPanelActions = Pick<
  PanelSelectionMenuItem,
  'id' | 'isDisabled' | 'data-test-subj' | 'order'
> & {
  title: string;
  items: PanelSelectionMenuItem[];
};

const onAddPanelActionClick =
  (action: Action, context: ActionExecutionContext<object>, closePopover: () => void) =>
  (event: React.MouseEvent) => {
    closePopover();
    if (event.currentTarget instanceof HTMLAnchorElement) {
      if (
        !event.defaultPrevented && // onClick prevented default
        event.button === 0 &&
        (!event.currentTarget.target || event.currentTarget.target === '_self') &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      ) {
        event.preventDefault();
        action.execute(context);
      }
    } else action.execute(context);
  };

export const getAddPanelActionMenuItemsGroup = (
  api: PresentationContainer,
  actions: Array<Action<object>> | undefined,
  onPanelSelected: () => void
) => {
  const grouped: Record<string, GroupedAddPanelActions> = {};

  const context = {
    embeddable: api,
    trigger: addPanelMenuTrigger,
  };

  const getMenuItem = (item: Action<object>): PanelSelectionMenuItem => {
    const actionName = item.getDisplayName(context);

    return {
      id: item.id,
      name: actionName,
      icon:
        (typeof item.getIconType === 'function' ? item.getIconType(context) : undefined) ?? 'empty',
      onClick: onAddPanelActionClick(item, context, onPanelSelected),
      'data-test-subj': `create-action-${actionName}`,
      description: item?.getDisplayNameTooltip?.(context),
      order: item.order ?? 0,
    };
  };

  actions?.forEach((item) => {
    if (Array.isArray(item.grouping)) {
      item.grouping.forEach((group) => {
        const groupId = group.id;
        if (!grouped[groupId]) {
          grouped[groupId] = {
            id: groupId,
            title: group.getDisplayName ? group.getDisplayName(context) : '',
            'data-test-subj': `dashboardEditorMenu-${groupId}Group`,
            order: group.order ?? 0,
            items: [],
          };
        }

        grouped[group.id]!.items!.push(getMenuItem(item));
      });
    } else {
      // use other group as the default for definitions that don't have a group
      const fallbackGroup = ADD_PANEL_OTHER_GROUP;

      if (!grouped[fallbackGroup.id]) {
        grouped[fallbackGroup.id] = {
          id: fallbackGroup.id,
          title: fallbackGroup.getDisplayName?.() || '',
          'data-test-subj': `dashboardEditorMenu-${fallbackGroup.id}Group`,
          order: fallbackGroup.order || 0,
          items: [],
        };
      }

      grouped[fallbackGroup.id].items.push(getMenuItem(item));
    }
  });

  return grouped;
};
