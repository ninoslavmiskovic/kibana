/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  selectThresholdRuleType,
  selectIndicatorMatchType,
  selectNewTermsRuleType,
  selectEsqlRuleType,
} from '../../../../tasks/create_new_rule';
import { login } from '../../../../tasks/login';
import { visit } from '../../../../tasks/navigation';
import {
  ALERT_SUPPRESSION_FIELDS_INPUT,
  MACHINE_LEARNING_TYPE,
  THRESHOLD_ENABLE_SUPPRESSION_CHECKBOX,
} from '../../../../screens/create_new_rule';
import { CREATE_RULE_URL } from '../../../../urls/navigation';

describe(
  'Alert Suppression - Essentials tier license check',
  {
    tags: ['@serverless'],
    env: {
      ftrConfig: {
        productTypes: [
          { product_line: 'security', product_tier: 'essentials' },
          { product_line: 'endpoint', product_tier: 'essentials' },
        ],
      },
    },
  },
  () => {
    beforeEach(() => {
      login();
      visit(CREATE_RULE_URL);
    });

    it('Alert suppression is enabled for essentials tier for rule types that support it', () => {
      //  default custom query rule
      cy.get(ALERT_SUPPRESSION_FIELDS_INPUT).should('be.enabled');

      selectIndicatorMatchType();
      cy.get(ALERT_SUPPRESSION_FIELDS_INPUT).should('be.enabled');

      selectNewTermsRuleType();
      cy.get(ALERT_SUPPRESSION_FIELDS_INPUT).should('be.enabled');

      selectThresholdRuleType();
      cy.get(THRESHOLD_ENABLE_SUPPRESSION_CHECKBOX).should('be.enabled');

      selectEsqlRuleType();
      cy.get(ALERT_SUPPRESSION_FIELDS_INPUT).should('be.enabled');

      // ML Rules require Complete tier
      cy.get(MACHINE_LEARNING_TYPE).get('button').should('be.disabled');
    });
  }
);
