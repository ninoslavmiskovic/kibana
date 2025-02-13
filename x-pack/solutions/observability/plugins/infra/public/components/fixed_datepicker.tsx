/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiDatePickerProps } from '@elastic/eui';
import { EuiDatePicker } from '@elastic/eui';
import React from 'react';
import styled, { type StyledComponent } from '@emotion/styled';

// The return type of this component needs to be specified because the inferred
// return type depends on types that are not exported from EUI. You get a TS4023
// error if the return type is not specified.
export const FixedDatePicker: StyledComponent<EuiDatePickerProps> = styled(
  ({
    className,
    inputClassName,
    ...datePickerProps
  }: {
    className?: string;
    inputClassName?: string;
  } & EuiDatePickerProps) => (
    <EuiDatePicker {...datePickerProps} className={inputClassName} popperClassName={className} />
  )
)`
  z-index: 3 !important;
`;
