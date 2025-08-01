/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { Fragment } from 'react';
import { EuiFieldNumber, EuiFlexItem, EuiFormRow, EuiSelect } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import {
  OUTLIER_ANALYSIS_METHOD,
  ANALYSIS_ADVANCED_FIELDS,
} from '@kbn/ml-data-frame-analytics-utils';
import type { CreateAnalyticsFormProps } from '../../../analytics_management/hooks/use_create_analytics_form';
import type { AdvancedParamErrors } from './advanced_step_form';
import { getNumberValue } from './advanced_step_form';

interface Props extends CreateAnalyticsFormProps {
  advancedParamErrors: AdvancedParamErrors;
}

export const OutlierHyperParameters: FC<Props> = ({ actions, state, advancedParamErrors }) => {
  const { setFormState } = actions;

  const { method, nNeighbors, outlierFraction, standardizationEnabled } = state.form;

  return (
    <Fragment>
      <EuiFlexItem>
        <EuiFormRow
          label={i18n.translate('xpack.ml.dataframe.analytics.create.methodLabel', {
            defaultMessage: 'Method',
          })}
          helpText={i18n.translate('xpack.ml.dataframe.analytics.create.methodHelpText', {
            defaultMessage:
              'Set the method that outlier detection uses. If not set, uses an ensemble of different methods, normalizes and combines their individual outlier scores to obtain the overall outlier score. It is recommended to use the ensemble method.',
          })}
          isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.METHOD] !== undefined}
          error={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.METHOD]}
        >
          <EuiSelect
            isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.METHOD] !== undefined}
            options={Object.values(OUTLIER_ANALYSIS_METHOD).map((outlierMethod) => ({
              value: outlierMethod,
              text: outlierMethod,
            }))}
            value={method}
            hasNoInitialSelection={true}
            onChange={(e) => {
              setFormState({ method: e.target.value });
            }}
            data-test-subj="mlAnalyticsCreateJobWizardMethodInput"
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label={i18n.translate('xpack.ml.dataframe.analytics.create.nNeighborsLabel', {
            defaultMessage: 'N neighbors',
          })}
          helpText={i18n.translate('xpack.ml.dataframe.analytics.create.nNeighborsHelpText', {
            defaultMessage:
              'The value for how many nearest neighbors each method of outlier detection uses to calculate its outlier score. When not set, different values are used for different ensemble members. Must be a positive integer.',
          })}
          isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.N_NEIGHBORS] !== undefined}
          error={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.N_NEIGHBORS]}
        >
          <EuiFieldNumber
            isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.N_NEIGHBORS] !== undefined}
            aria-label={i18n.translate(
              'xpack.ml.dataframe.analytics.create.nNeighborsInputAriaLabel',
              {
                defaultMessage:
                  'The value for how many nearest neighbors each method of outlier detection uses to calculate its outlier score.',
              }
            )}
            data-test-subj="mlAnalyticsCreateJobWizardnNeighborsInput"
            onChange={(e) =>
              setFormState({ nNeighbors: e.target.value === '' ? undefined : +e.target.value })
            }
            step={1}
            min={1}
            value={getNumberValue(nNeighbors)}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label={i18n.translate('xpack.ml.dataframe.analytics.create.outlierFractionLabel', {
            defaultMessage: 'Outlier fraction',
          })}
          helpText={i18n.translate('xpack.ml.dataframe.analytics.create.outlierFractionHelpText', {
            defaultMessage:
              'Set the proportion of the data set that is assumed to be outlying prior to outlier detection.',
          })}
          isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.OUTLIER_FRACTION] !== undefined}
          error={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.OUTLIER_FRACTION]}
        >
          <EuiFieldNumber
            isInvalid={advancedParamErrors[ANALYSIS_ADVANCED_FIELDS.OUTLIER_FRACTION] !== undefined}
            aria-label={i18n.translate(
              'xpack.ml.dataframe.analytics.create.outlierFractionInputAriaLabel',
              {
                defaultMessage:
                  'Sets the proportion of the data set that is assumed to be outlying prior to outlier detection.',
              }
            )}
            data-test-subj="mlAnalyticsCreateJobWizardoutlierFractionInput"
            onChange={(e) =>
              setFormState({ outlierFraction: e.target.value === '' ? undefined : +e.target.value })
            }
            step={0.001}
            min={0}
            max={1}
            value={getNumberValue(outlierFraction)}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label={i18n.translate('xpack.ml.dataframe.analytics.create.standardizationEnabledLabel', {
            defaultMessage: 'Standardization enabled',
          })}
          helpText={i18n.translate(
            'xpack.ml.dataframe.analytics.create.standardizationEnabledHelpText',
            {
              defaultMessage:
                'If true, the following operation is performed on the columns before computing outlier scores: (x_i - mean(x_i)) / sd(x_i).',
            }
          )}
        >
          <EuiSelect
            aria-label={i18n.translate(
              'xpack.ml.dataframe.analytics.create.standardizationEnabledInputAriaLabel',
              {
                defaultMessage: 'Sets standardization enabled setting.',
              }
            )}
            data-test-subj="mlAnalyticsCreateJobWizardStandardizationEnabledInput"
            options={[
              {
                value: 'true',
                text: i18n.translate(
                  'xpack.ml.dataframe.analytics.create.standardizationEnabledTrueValue',
                  {
                    defaultMessage: 'True',
                  }
                ),
              },
              {
                value: 'false',
                text: i18n.translate(
                  'xpack.ml.dataframe.analytics.create.standardizationEnabledFalseValue',
                  {
                    defaultMessage: 'False',
                  }
                ),
              },
            ]}
            value={standardizationEnabled ? 'true' : 'false'}
            hasNoInitialSelection={true}
            onChange={(e) => {
              setFormState({ standardizationEnabled: e.target.value === 'true' ? true : false });
            }}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </Fragment>
  );
};
