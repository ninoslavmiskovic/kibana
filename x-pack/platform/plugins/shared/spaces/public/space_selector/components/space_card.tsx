/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiCard, EuiLoadingSpinner, EuiTextColor, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import React, { lazy, Suspense } from 'react';

import type { Space } from '../../../common';
import { addSpaceIdToPath, ENTER_SPACE_PATH } from '../../../common';
import { getSpaceAvatarComponent } from '../../space_avatar';
import { SpaceSolutionBadge } from '../../space_solution_badge';

// No need to wrap LazySpaceAvatar in an error boundary, because it is one of the first chunks loaded when opening Kibana.
const LazySpaceAvatar = lazy(() =>
  getSpaceAvatarComponent().then((component) => ({ default: component }))
);

interface Props {
  space: Space;
  serverBasePath: string;
}
export const SpaceCard = (props: Props) => {
  const { serverBasePath, space } = props;
  const { euiTheme } = useEuiTheme();

  return (
    <EuiCard
      css={css`
        width: calc(${euiTheme.size.l} * 10) !important;
        min-height: calc(${euiTheme.size.base} * 12.5); /* 200px */

        .euiCard__content {
          overflow: hidden;
        }
      `}
      data-test-subj={`space-card-${space.id}`}
      icon={renderSpaceAvatar(space)}
      title={space.name}
      description={renderSpaceDescription(space)}
      footer={renderSpaceFooter(space)}
      href={addSpaceIdToPath(serverBasePath, space.id, ENTER_SPACE_PATH)}
    />
  );
};

function renderSpaceAvatar(space: Space) {
  // not announcing space name here because the title of the EuiCard that the SpaceAvatar lives in is already
  // announcing it. See https://github.com/elastic/kibana/issues/27748
  return (
    <Suspense fallback={<EuiLoadingSpinner size="xxl" />}>
      <LazySpaceAvatar space={space} size={'l'} announceSpaceName={false} />
    </Suspense>
  );
}

function renderSpaceDescription(space: Space) {
  let description: JSX.Element | string = space.description || '';
  const needsTruncation = description.length > 120;
  if (needsTruncation) {
    description = description.substr(0, 120) + '…';
  }

  return (
    <EuiTextColor color="subdued" title={description} className="eui-textBreakWord">
      {description}
    </EuiTextColor>
  );
}

function renderSpaceFooter(space: Space) {
  if (!space.solution) {
    return undefined;
  }

  return <SpaceSolutionBadge solution={space.solution} />;
}
