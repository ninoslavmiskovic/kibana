/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import { mount } from 'enzyme';
import { waitFor } from '@testing-library/react';

import type { FormHook } from '@kbn/es-ui-shared-plugin/static/forms/hook_form_lib';
import { useForm, Form } from '@kbn/es-ui-shared-plugin/static/forms/hook_form_lib';
import { SyncAlertsToggle } from './sync_alerts_toggle';
import type { FormProps } from './schema';
import { schema } from './schema';

describe('SyncAlertsToggle', () => {
  let globalForm: FormHook;

  const MockHookWrapperComponent: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const { form } = useForm<FormProps>({
      defaultValue: { syncAlerts: true },
      schema: {
        syncAlerts: schema.syncAlerts,
      },
    });

    globalForm = form;

    return <Form form={form}>{children}</Form>;
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('it renders', async () => {
    const wrapper = mount(
      <MockHookWrapperComponent>
        <SyncAlertsToggle isLoading={false} />
      </MockHookWrapperComponent>
    );

    expect(wrapper.find(`[data-test-subj="caseSyncAlerts"]`).exists()).toBeTruthy();
  });

  it('it toggles the switch', async () => {
    const wrapper = mount(
      <MockHookWrapperComponent>
        <SyncAlertsToggle isLoading={false} />
      </MockHookWrapperComponent>
    );

    wrapper.find('[data-test-subj="caseSyncAlerts"] button').first().simulate('click');

    await waitFor(() => {
      expect(globalForm.getFormData()).toEqual({ syncAlerts: false });
    });
  });

  it('it shows the correct labels', async () => {
    const wrapper = mount(
      <MockHookWrapperComponent>
        <SyncAlertsToggle isLoading={false} />
      </MockHookWrapperComponent>
    );

    expect(wrapper.find(`[data-test-subj="caseSyncAlerts"] .euiSwitch__label`).first().text()).toBe(
      'On'
    );

    wrapper.find('[data-test-subj="caseSyncAlerts"] button').first().simulate('click');

    await waitFor(() => {
      expect(
        wrapper.find(`[data-test-subj="caseSyncAlerts"] .euiSwitch__label`).first().text()
      ).toBe('Off');
    });
  });
});
