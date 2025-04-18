/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { dynamic } from '@kbn/shared-ux-utility';
import type { MlRoute } from '../../router';
import { PageLoader } from '../../router';
import { useRouteResolver } from '../../use_resolver';
import { basicResolvers, initSavedObjects } from '../../resolvers';
import { type NavigateToApp, getStackManagementBreadcrumb } from '../../breadcrumbs';
import { MlPageHeader } from '../../../components/page_header';

const ModelsList = dynamic(async () => ({
  default: (await import('../../../model_management/models_list')).ModelsList,
}));

export const modelsListRouteFactory = (navigateToApp: NavigateToApp): MlRoute => ({
  id: 'trained_models',
  path: '/',
  title: i18n.translate('xpack.ml.modelManagement.trainedModels.docTitle', {
    defaultMessage: 'Trained Models',
  }),
  render: () => <PageWrapper />,
  breadcrumbs: [
    getStackManagementBreadcrumb(navigateToApp),
    {
      text: i18n.translate('xpack.ml.trainedModelsBreadcrumbs.trainedModelsLabel', {
        defaultMessage: 'Trained Models',
      }),
    },
  ],
  enableDatePicker: true,
  'data-test-subj': 'mlPageModelManagement',
});

const PageWrapper: FC = () => {
  const { context } = useRouteResolver('full', ['canGetTrainedModels'], {
    ...basicResolvers(),
    initSavedObjects,
  });
  return (
    <PageLoader context={context}>
      <MlPageHeader>
        <EuiFlexGroup responsive={false} wrap={false} alignItems={'center'} gutterSize={'m'}>
          <EuiFlexItem grow={false}>
            <FormattedMessage
              id="xpack.ml.modelManagement.trainedModelsHeader"
              defaultMessage="Trained Models"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </MlPageHeader>

      <EuiSpacer size="m" />
      <ModelsList />
    </PageLoader>
  );
};
