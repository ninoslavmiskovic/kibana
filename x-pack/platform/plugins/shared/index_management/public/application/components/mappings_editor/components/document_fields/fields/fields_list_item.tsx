/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { forwardRef } from 'react';
import classNames from 'classnames';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
  EuiButtonIcon,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import { NormalizedField, NormalizedFields, State } from '../../../types';
import { getTypeLabelFromField } from '../../../lib';
import { CHILD_FIELD_INDENT_SIZE, LEFT_PADDING_SIZE_FIELD_ITEM_WRAPPER } from '../../../constants';

import { FieldsList } from './fields_list';
import { CreateField } from './create_field';
import { DeleteFieldProvider } from './delete_field_provider';

const i18nTexts = {
  addMultiFieldButtonLabel: i18n.translate(
    'xpack.idxMgmt.mappingsEditor.addMultiFieldTooltipLabel',
    {
      defaultMessage: 'Add a multi-field to index the same field in different ways.',
    }
  ),
  addPropertyButtonLabel: i18n.translate('xpack.idxMgmt.mappingsEditor.addPropertyButtonLabel', {
    defaultMessage: 'Add property',
  }),
  editButtonLabel: i18n.translate('xpack.idxMgmt.mappingsEditor.editFieldButtonLabel', {
    defaultMessage: 'Edit',
  }),
  deleteButtonLabel: i18n.translate('xpack.idxMgmt.mappingsEditor.removeFieldButtonLabel', {
    defaultMessage: 'Remove',
  }),
  fieldIsShadowedLabel: i18n.translate('xpack.idxMgmt.mappingsEditor.fieldIsShadowedLabel', {
    defaultMessage: 'Field shadowed by a runtime field with the same name.',
  }),
};

interface Props {
  field: NormalizedField;
  allFields: NormalizedFields['byId'];
  isCreateFieldFormVisible: boolean;
  areActionButtonsVisible: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isLastItem: boolean;
  isShadowed?: boolean;
  childFieldsArray: NormalizedField[];
  maxNestedDepth: number;
  addField(): void;
  editField(): void;
  toggleExpand: () => void;
  setPreviousState?: (state: State) => void;
  treeDepth: number;
  state: State;
  isAddingFields?: boolean;
  createFieldFormRef?: React.RefObject<HTMLDivElement>;
  pendingFieldsRef?: React.RefObject<HTMLDivElement>;
}

function FieldListItemComponent(
  {
    field,
    allFields,
    isHighlighted,
    isDimmed,
    isCreateFieldFormVisible,
    areActionButtonsVisible,
    isLastItem,
    isShadowed = false,
    childFieldsArray,
    maxNestedDepth,
    addField,
    editField,
    toggleExpand,
    treeDepth,
    state,
    isAddingFields,
    setPreviousState,
    pendingFieldsRef,
  }: Props,
  ref: React.Ref<HTMLLIElement>
) {
  const {
    source,
    isMultiField,
    canHaveChildFields,
    hasChildFields,
    canHaveMultiFields,
    hasMultiFields,
    isExpanded,
    path,
  } = field;

  // When there aren't any "child" fields (the maxNestedDepth === 0), there is no toggle icon on the left of any field.
  // For that reason, we need to compensate and substract some indent to left align on the page.
  const substractIndentAmount = maxNestedDepth === 0 ? CHILD_FIELD_INDENT_SIZE * 0.5 : 0;
  const indent = treeDepth * CHILD_FIELD_INDENT_SIZE - substractIndentAmount;

  const isSemanticText = source.type === 'semantic_text';

  const indentCreateField =
    (treeDepth + 1) * CHILD_FIELD_INDENT_SIZE +
    LEFT_PADDING_SIZE_FIELD_ITEM_WRAPPER -
    substractIndentAmount;

  const hasDottedLine = isMultiField
    ? isLastItem
      ? false
      : true
    : canHaveMultiFields && isExpanded;

  const renderCreateField = () => {
    if (!isCreateFieldFormVisible) {
      return null;
    }

    return (
      <CreateField
        allFields={allFields}
        isRootLevelField={false}
        isMultiField={canHaveMultiFields}
        paddingLeft={indentCreateField}
        maxNestedDepth={maxNestedDepth}
        isAddingFields={isAddingFields}
      />
    );
  };

  const renderActionButtons = () => {
    if (!areActionButtonsVisible) {
      return null;
    }

    const { addMultiFieldButtonLabel, addPropertyButtonLabel, editButtonLabel, deleteButtonLabel } =
      i18nTexts;
    return (
      <EuiFlexGroup gutterSize="s" className="mappingsEditor__fieldsListItem__actions">
        {canHaveMultiFields && (
          <EuiFlexItem grow={false}>
            <EuiToolTip content={addMultiFieldButtonLabel}>
              <EuiButtonIcon
                iconType="documents"
                onClick={addField}
                data-test-subj="addMultiFieldButton"
                aria-label={addMultiFieldButtonLabel}
              />
            </EuiToolTip>
          </EuiFlexItem>
        )}

        {canHaveChildFields && (
          <EuiFlexItem grow={false}>
            <EuiToolTip content={addPropertyButtonLabel}>
              <EuiButtonIcon
                iconType="plusInCircle"
                onClick={addField}
                data-test-subj="addPropertyButton"
                aria-label={addPropertyButtonLabel}
              />
            </EuiToolTip>
          </EuiFlexItem>
        )}

        <EuiFlexItem grow={false}>
          <EuiToolTip content={editButtonLabel}>
            <EuiButtonIcon
              iconType="pencil"
              onClick={editField}
              data-test-subj="editFieldButton"
              aria-label={editButtonLabel}
            />
          </EuiToolTip>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <DeleteFieldProvider>
            {(deleteField) => (
              <EuiToolTip content={deleteButtonLabel}>
                <EuiButtonIcon
                  iconType="trash"
                  color="danger"
                  onClick={() => deleteField(field)}
                  data-test-subj="removeFieldButton"
                  aria-label={deleteButtonLabel}
                />
              </EuiToolTip>
            )}
          </DeleteFieldProvider>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  const dataTestSubj = `${path.join('')}Field`;

  return (
    <li
      className={classNames('mappingsEditor__fieldsListItem', {
        'mappingsEditor__fieldsListItem--dottedLine': hasDottedLine,
      })}
      data-test-subj={`fieldsListItem ${dataTestSubj}`}
      ref={ref}
    >
      <div
        style={{ paddingLeft: `${indent}px` }}
        className={classNames('mappingsEditor__fieldsListItem__field', {
          'mappingsEditor__fieldsListItem__field--enabled': areActionButtonsVisible,
          'mappingsEditor__fieldsListItem__field--highlighted': isHighlighted,
          'mappingsEditor__fieldsListItem__field--dim': isDimmed,
        })}
      >
        <div
          className={classNames('mappingsEditor__fieldsListItem__wrapper', {
            'mappingsEditor__fieldsListItem__wrapper--indent':
              treeDepth === 0 && maxNestedDepth === 0,
          })}
        >
          <EuiFlexGroup
            gutterSize="s"
            alignItems="center"
            className={classNames('mappingsEditor__fieldsListItem__content', {
              'mappingsEditor__fieldsListItem__content--toggle': hasChildFields || hasMultiFields,
              'mappingsEditor__fieldsListItem__content--multiField': isMultiField,
              'mappingsEditor__fieldsListItem__content--indent':
                !hasChildFields && !hasMultiFields && maxNestedDepth > treeDepth,
            })}
          >
            {(hasChildFields || hasMultiFields) && (
              <EuiFlexItem grow={false} className="mappingsEditor__fieldsListItem__toggle">
                <EuiButtonIcon
                  color="text"
                  onClick={toggleExpand}
                  iconType={isExpanded ? 'arrowDown' : 'arrowRight'}
                  data-test-subj="toggleExpandButton"
                  aria-label={
                    isExpanded
                      ? i18n.translate('xpack.idxMgmt.mappingsEditor.collapseFieldButtonLabel', {
                          defaultMessage: 'Collapse field {name}',
                          values: {
                            name: source.name,
                          },
                        })
                      : i18n.translate('xpack.idxMgmt.mappingsEditor.expandFieldButtonLabel', {
                          defaultMessage: 'Expand field {name}',
                          values: {
                            name: source.name,
                          },
                        })
                  }
                />
              </EuiFlexItem>
            )}

            {isMultiField && (
              <EuiFlexItem grow={false} className="mappingsEditor__fieldsListItem__icon">
                <EuiIcon color="subdued" type="documents" />
              </EuiFlexItem>
            )}

            <EuiFlexItem
              grow={false}
              className="mappingsEditor__fieldsListItem__name"
              data-test-subj={`fieldName ${dataTestSubj}-fieldName`}
            >
              {source.name}
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiBadge
                color="hollow"
                data-test-subj={`${dataTestSubj}-datatype`}
                data-type-value={source.type}
              >
                {isMultiField
                  ? i18n.translate('xpack.idxMgmt.mappingsEditor.multiFieldBadgeLabel', {
                      defaultMessage: '{dataType} multi-field',
                      values: {
                        dataType: getTypeLabelFromField(source),
                      },
                    })
                  : getTypeLabelFromField(source)}
              </EuiBadge>
            </EuiFlexItem>

            {isSemanticText && source.inference_id ? (
              <EuiFlexItem grow={false}>
                <EuiBadge color="hollow">{source.inference_id as string}</EuiBadge>
              </EuiFlexItem>
            ) : null}

            {isShadowed && (
              <EuiFlexItem grow={false}>
                <EuiToolTip content={i18nTexts.fieldIsShadowedLabel}>
                  <EuiBadge color="warning" data-test-subj="isShadowedIndicator">
                    {i18n.translate('xpack.idxMgmt.mappingsEditor.shadowedBadgeLabel', {
                      defaultMessage: 'Shadowed',
                    })}
                  </EuiBadge>
                </EuiToolTip>
              </EuiFlexItem>
            )}

            <EuiFlexItem grow={false}>{renderActionButtons()}</EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>

      {Boolean(childFieldsArray.length) && isExpanded && (
        <FieldsList
          fields={childFieldsArray}
          treeDepth={treeDepth + 1}
          state={state}
          isAddingFields={isAddingFields}
          setPreviousState={setPreviousState}
          pendingFieldsRef={pendingFieldsRef}
        />
      )}

      {renderCreateField()}
    </li>
  );
}

export const FieldsListItem = React.memo(forwardRef<HTMLLIElement, Props>(FieldListItemComponent));
