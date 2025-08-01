/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { i18n } from '@kbn/i18n';
import { FieldsListItemContainer } from './fields_list_item_container';
import { NormalizedField, State } from '../../../types';

interface Props {
  fields?: NormalizedField[];
  treeDepth?: number;
  state: State;
  setPreviousState?: (state: State) => void;
  isAddingFields?: boolean;
  pendingFieldsRef?: React.RefObject<HTMLDivElement>;
}

export const FieldsList = React.memo(function FieldsListComponent({
  fields,
  treeDepth,
  state,
  setPreviousState,
  isAddingFields,
  pendingFieldsRef,
}: Props) {
  if (fields === undefined) {
    return null;
  }
  return (
    <ul
      data-test-subj="fieldsList"
      aria-label={i18n.translate('xpack.idxMgmt.mappingsEditor.fieldListLabel', {
        defaultMessage: 'Saved mapping fields',
      })}
    >
      {fields.map((field, index) => (
        <FieldsListItemContainer
          key={field.id}
          fieldId={field.id}
          treeDepth={treeDepth === undefined ? 0 : treeDepth}
          isLastItem={index === fields.length - 1}
          state={state}
          setPreviousState={setPreviousState}
          isAddingFields={isAddingFields}
          pendingFieldsRef={pendingFieldsRef}
        />
      ))}
    </ul>
  );
});
