/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { schema, type Type, TypeOf } from '@kbn/config-schema';
import { get } from 'lodash';
import { Env } from '@kbn/config';
import type { ServiceConfigDescriptor } from '@kbn/core-base-server-internal';

import { KIBANA_GROUPS, type KibanaGroup } from '@kbn/projects-solutions-groups';
import { ENABLE_ALL_PLUGINS_CONFIG_PATH, INCLUDED_PLUGIN_GROUPS } from './constants';

const configSchema = schema.object({
  initialize: schema.boolean({ defaultValue: true }),

  /**
   * Defines an array of directories where another plugin should be loaded from.
   */
  paths: schema.arrayOf(schema.string(), { defaultValue: [] }),
  /**
   * Defines an array of groups to include when loading plugins.
   * Plugins from all groups will be taken into account if the parameter is not provided.
   */
  allowlistPluginGroups: schema.maybe(
    schema.arrayOf(
      schema.oneOf(
        KIBANA_GROUPS.map((groupName) => schema.literal(groupName)) as [
          Type<KibanaGroup> // This cast is needed because it's different to Type<T>[] :sight:
        ]
      )
    )
  ),
  /**
   * Internal config, not intended to be used by end users. Only for specific
   * internal purposes.
   */
  forceEnableAllPlugins: schema.maybe(schema.boolean({ defaultValue: false })),
});

type InternalPluginsConfigType = TypeOf<typeof configSchema>;

export type PluginsConfigType = Omit<InternalPluginsConfigType, '__internal__'>;

export const config: ServiceConfigDescriptor<PluginsConfigType> = {
  path: 'plugins',
  schema: configSchema,
};

/** @internal */
export class PluginsConfig {
  /**
   * Indicates whether or not plugins should be initialized.
   */
  public readonly initialize: boolean;

  /**
   * Defines directories that we should scan for the plugin subdirectories.
   */
  public readonly pluginSearchPaths: readonly string[];

  /**
   * Defines directories where an additional plugin exists.
   */
  public readonly additionalPluginPaths: readonly string[];

  /**
   * Whether to enable all plugins.
   *
   * @note this is intended to be an undocumented setting.
   */
  public readonly shouldEnableAllPlugins: boolean;

  /**
   * Specify an allowlist of plugin groups.
   * Allows reducing the amount of plugins that are taken into account.
   * The list will default to "all plugin groups" if the config is not present.
   */
  public readonly allowlistPluginGroups?: readonly KibanaGroup[];

  constructor(rawConfig: PluginsConfigType, env: Env) {
    this.initialize = rawConfig.initialize;
    this.pluginSearchPaths = env.pluginSearchPaths;
    this.additionalPluginPaths = rawConfig.paths;
    this.allowlistPluginGroups = get(rawConfig, INCLUDED_PLUGIN_GROUPS);
    this.shouldEnableAllPlugins = get(rawConfig, ENABLE_ALL_PLUGINS_CONFIG_PATH, false);
  }
}
