/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { HttpSetup } from '@kbn/core-http-browser';
import { ApiConfig } from '@kbn/elastic-assistant-common';
import { OpenAiProviderType } from '@kbn/stack-connectors-plugin/public/common';

import { fetchConnectorExecuteAction, FetchConnectorExecuteAction } from '.';
import { API_ERROR } from '../translations';

jest.mock('@kbn/core-http-browser');

const mockHttp = {
  fetch: jest.fn(),
} as unknown as HttpSetup;

const apiConfig: Record<'openai' | 'bedrock' | 'gemini', ApiConfig> = {
  openai: {
    connectorId: 'foo',
    actionTypeId: '.gen-ai',
    model: 'gpt-4',
    provider: OpenAiProviderType.OpenAi,
  },
  bedrock: {
    connectorId: 'foo',
    actionTypeId: '.bedrock',
  },
  gemini: {
    connectorId: 'foo',
    actionTypeId: '.gemini',
  },
};

const fetchConnectorArgs: FetchConnectorExecuteAction = {
  apiConfig: apiConfig.openai,
  assistantStreamingEnabled: true,
  http: mockHttp,
  message: 'This is a test',
  conversationId: 'test',
  replacements: {},
  screenContext: {
    timeZone: 'America/New_York',
  },
};
const streamingDefaults = {
  method: 'POST',
  asResponse: true,
  rawResponse: true,
  signal: undefined,
  version: '1',
};

const staticDefaults = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  signal: undefined,
  version: '1',
};
describe('API tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchConnectorExecuteAction', () => {
    it('calls the non-stream API when assistantStreamingEnabled is false', async () => {
      await fetchConnectorExecuteAction({
        ...fetchConnectorArgs,
        assistantStreamingEnabled: false,
      });

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...staticDefaults,
          body: '{"model":"gpt-4","message":"This is a test","subAction":"invokeAI","conversationId":"test","actionTypeId":".gen-ai","replacements":{},"screenContext":{"timeZone":"America/New_York"}}',
        }
      );
    });

    it('calls the stream API when assistantStreamingEnabled is true', async () => {
      await fetchConnectorExecuteAction(fetchConnectorArgs);

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...streamingDefaults,
          body: '{"model":"gpt-4","message":"This is a test","subAction":"invokeStream","conversationId":"test","actionTypeId":".gen-ai","replacements":{},"screenContext":{"timeZone":"America/New_York"}}',
        }
      );
    });

    it('calls the stream API when assistantStreamingEnabled is true and actionTypeId is bedrock', async () => {
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
        apiConfig: apiConfig.bedrock,
      };

      await fetchConnectorExecuteAction(testProps);

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...streamingDefaults,
          body: '{"message":"This is a test","subAction":"invokeStream","conversationId":"test","actionTypeId":".bedrock","replacements":{},"screenContext":{"timeZone":"America/New_York"}}',
        }
      );
    });

    it('calls the stream API when assistantStreamingEnabled is true and actionTypeId is gemini', async () => {
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
        apiConfig: apiConfig.gemini,
      };

      await fetchConnectorExecuteAction(testProps);

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...streamingDefaults,
          body: '{"message":"This is a test","subAction":"invokeStream","conversationId":"test","actionTypeId":".gemini","replacements":{},"screenContext":{"timeZone":"America/New_York"}}',
        }
      );
    });

    it('calls the stream API when assistantStreamingEnabled is true and actionTypeId is .bedrock', async () => {
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
        apiConfig: apiConfig.bedrock,
      };

      await fetchConnectorExecuteAction(testProps);

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...streamingDefaults,
          body: '{"message":"This is a test","subAction":"invokeStream","conversationId":"test","actionTypeId":".bedrock","replacements":{},"screenContext":{"timeZone":"America/New_York"}}',
        }
      );
    });

    it('calls the api with the expected optional request parameters', async () => {
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
        assistantStreamingEnabled: false,
        alertsIndexPattern: '.alerts-security.alerts-default',
        replacements: { auuid: 'real.hostname' },
        size: 30,
      };

      await fetchConnectorExecuteAction(testProps);

      expect(mockHttp.fetch).toHaveBeenCalledWith(
        '/internal/elastic_assistant/actions/connector/foo/_execute',
        {
          ...staticDefaults,
          body: '{"model":"gpt-4","message":"This is a test","subAction":"invokeAI","conversationId":"test","actionTypeId":".gen-ai","replacements":{"auuid":"real.hostname"},"screenContext":{"timeZone":"America/New_York"},"alertsIndexPattern":".alerts-security.alerts-default","size":30}',
        }
      );
    });

    it('returns API_ERROR when the response status is error and langchain is on', async () => {
      (mockHttp.fetch as jest.Mock).mockResolvedValue({ status: 'error' });

      const result = await fetchConnectorExecuteAction(fetchConnectorArgs);

      expect(result).toEqual({
        response: `${API_ERROR}\n\nCould not get reader from response`,
        isStream: false,
        isError: true,
      });
    });

    it('returns API_ERROR + error message on non streaming responses', async () => {
      (mockHttp.fetch as jest.Mock).mockResolvedValue({
        status: 'error',
        service_message: 'an error message',
      });
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
        assistantStreamingEnabled: false,
      };

      const result = await fetchConnectorExecuteAction(testProps);

      expect(result).toEqual({
        response: `${API_ERROR}\n\nan error message`,
        isStream: false,
        isError: true,
      });
    });

    it('returns API_ERROR when the response status is error, langchain is off, and response is not a reader', async () => {
      (mockHttp.fetch as jest.Mock).mockResolvedValue({ status: 'error' });

      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
      };

      const result = await fetchConnectorExecuteAction(testProps);

      expect(result).toEqual({
        response: `${API_ERROR}\n\nCould not get reader from response`,
        isStream: false,
        isError: true,
      });
    });

    it('returns API_ERROR when the response is error, langchain is off, and response is a reader', async () => {
      const mockReader = jest.fn();
      (mockHttp.fetch as jest.Mock).mockRejectedValue({
        response: { body: { getReader: jest.fn().mockImplementation(() => mockReader) } },
      });
      const testProps: FetchConnectorExecuteAction = {
        ...fetchConnectorArgs,
      };

      const result = await fetchConnectorExecuteAction(testProps);

      expect(result).toEqual({
        response: mockReader,
        isStream: true,
        isError: true,
      });
    });

    it('returns API_ERROR when there are no choices', async () => {
      (mockHttp.fetch as jest.Mock).mockResolvedValue({ status: 'ok', data: '' });

      const result = await fetchConnectorExecuteAction({
        ...fetchConnectorArgs,
        assistantStreamingEnabled: false,
      });

      expect(result).toEqual({ response: API_ERROR, isStream: false, isError: true });
    });

    it('returns the original when `content` is not JSON', async () => {
      const response = 'plain text content';

      (mockHttp.fetch as jest.Mock).mockResolvedValue({
        status: 'ok',
        data: response,
      });

      const result = await fetchConnectorExecuteAction({
        ...fetchConnectorArgs,
        assistantStreamingEnabled: false,
      });

      expect(result).toEqual({ response, isStream: false, isError: false });
    });
  });
});
