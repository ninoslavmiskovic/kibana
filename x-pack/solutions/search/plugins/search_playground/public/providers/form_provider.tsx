/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { FormProvider as ReactHookFormProvider, useForm } from 'react-hook-form';
import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';
import { useDebounceFn } from '@kbn/react-hooks';
import { useIndicesValidation } from '../hooks/use_indices_validation';
import { useLoadFieldsByIndices } from '../hooks/use_load_fields_by_indices';
import { useUserQueryValidations } from '../hooks/use_user_query_validations';
import { ChatForm, ChatFormFields } from '../types';
import { useLLMsModels } from '../hooks/use_llms_models';

type PartialChatForm = Partial<ChatForm>;
export const LOCAL_STORAGE_KEY = 'search_playground_session';
export const LOCAL_STORAGE_DEBOUNCE_OPTIONS = { wait: 100 };

const DEFAULT_FORM_VALUES: PartialChatForm = {
  prompt: 'You are an assistant for question-answering tasks.',
  doc_size: 3,
  source_fields: {},
  indices: [],
  summarization_model: undefined,
  [ChatFormFields.userElasticsearchQuery]: null,
  [ChatFormFields.userElasticsearchQueryValidations]: undefined,
};

const getLocalSession = (storage: Storage): PartialChatForm => {
  try {
    const localSessionJSON = storage.getItem(LOCAL_STORAGE_KEY);
    const sessionState = localSessionJSON ? JSON.parse(localSessionJSON) : {};

    return {
      ...DEFAULT_FORM_VALUES,
      ...sessionState,
    };
  } catch (e) {
    return DEFAULT_FORM_VALUES;
  }
};

const setLocalSession = (formState: PartialChatForm, storage: Storage) => {
  // omit question and search_query from the session state
  const {
    question,
    search_query: _searchQuery,
    [ChatFormFields.userElasticsearchQueryValidations]: _queryValidations,
    ...state
  } = formState;

  storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
};

interface FormProviderProps {
  storage?: Storage;
}

export const FormProvider: React.FC<React.PropsWithChildren<FormProviderProps>> = ({
  children,
  storage = localStorage,
}) => {
  const models = useLLMsModels();
  const [searchParams] = useSearchParams();
  const defaultIndex = useMemo(() => {
    const index = searchParams.get('default-index');

    return index ? [index] : null;
  }, [searchParams]);
  const sessionState: PartialChatForm = useMemo(() => getLocalSession(storage), [storage]);
  const form = useForm<ChatForm>({
    defaultValues: {
      ...sessionState,
      indices: [],
      search_query: '',
    },
  });
  const { isValidated: isValidatedIndices, validIndices } = useIndicesValidation(
    defaultIndex || sessionState.indices || []
  );
  useLoadFieldsByIndices({
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
  });
  useUserQueryValidations({
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
  });

  const setLocalSessionDebounce = useDebounceFn(setLocalSession, LOCAL_STORAGE_DEBOUNCE_OPTIONS);
  useEffect(() => {
    const subscription = form.watch((values) =>
      setLocalSessionDebounce.run(values as PartialChatForm, storage)
    );
    return () => subscription.unsubscribe();
  }, [form, storage, setLocalSessionDebounce]);

  useEffect(() => {
    const defaultModel = models.find((model) => !model.disabled);
    const currentModel = form.getValues(ChatFormFields.summarizationModel);

    if (defaultModel && (!currentModel || !models.find((model) => currentModel.id === model.id))) {
      form.setValue(ChatFormFields.summarizationModel, defaultModel);
    }
  }, [form, models]);

  useEffect(() => {
    if (isValidatedIndices) {
      form.setValue(ChatFormFields.indices, validIndices);
    }
  }, [form, isValidatedIndices, validIndices]);

  return <ReactHookFormProvider {...form}>{children}</ReactHookFormProvider>;
};
