/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { Component } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiEmptyPrompt, EuiSpacer, EuiText, EuiTextColor } from '@elastic/eui';

import { RequestStatus } from '../../../../common/adapters';
import { Request } from '../../../../common/adapters/request/types';
import { InspectorViewProps } from '../../../types';

import { RequestSelector } from './request_selector';
import { RequestDetails } from './request_details';
import { disambiguateRequestNames } from './disambiguate_request_names';

function getInitialRequest(requests: Request[], initialRequestId?: string) {
  const initialRequest = initialRequestId
    ? requests.find(({ id }) => id === initialRequestId)
    : undefined;

  if (initialRequest) {
    return initialRequest;
  }

  return requests.length ? requests[0] : null;
}

interface RequestViewOptions {
  initialRequestId?: string;
  initialTabs?: string[];
}

interface RequestSelectorState {
  requests: Request[];
  request: Request | null;
}

export class RequestsViewComponent extends Component<InspectorViewProps, RequestSelectorState> {
  constructor(props: InspectorViewProps) {
    super(props);

    props.adapters.requests!.on('change', this._onRequestsChange);

    const requests = this.getRequests();
    this.state = {
      requests,
      request: getInitialRequest(
        requests,
        (this.props.options as RequestViewOptions | undefined)?.initialRequestId
      ),
    };
  }

  getRequests(): Request[] {
    return disambiguateRequestNames(this.props.adapters.requests!.getRequests());
  }

  _onRequestsChange = () => {
    const requests = this.getRequests();
    const newState = { requests } as RequestSelectorState;

    if (!this.state.request || !requests.includes(this.state.request)) {
      newState.request = requests.length ? requests[0] : null;
    }
    this.setState(newState);
  };

  selectRequest = (request: Request) => {
    if (request !== this.state.request) {
      this.setState({ request });
    }
  };

  componentWillUnmount() {
    this.props.adapters.requests!.removeListener('change', this._onRequestsChange);
  }

  static renderEmptyRequests() {
    return (
      <EuiEmptyPrompt
        data-test-subj="inspectorNoRequestsMessage"
        title={
          <h2>
            <FormattedMessage
              id="inspector.requests.noRequestsLoggedTitle"
              defaultMessage="No requests logged"
            />
          </h2>
        }
        body={
          <React.Fragment>
            <p>
              <FormattedMessage
                id="inspector.requests.noRequestsLoggedDescription.elementHasNotLoggedAnyRequestsText"
                defaultMessage="The element hasn't logged any requests (yet)."
              />
            </p>
            <p>
              <FormattedMessage
                id="inspector.requests.noRequestsLoggedDescription.whatDoesItUsuallyMeanText"
                defaultMessage="This usually means that there was no need to fetch any data or
                  that the element has not yet started fetching data."
              />
            </p>
          </React.Fragment>
        }
      />
    );
  }

  render() {
    if (!this.state.requests || !this.state.requests.length) {
      return RequestsViewComponent.renderEmptyRequests();
    }

    const failedCount = this.state.requests.filter(
      (req: Request) => req.status === RequestStatus.ERROR
    ).length;

    return (
      <>
        <EuiText size="xs">
          <p role="status" aria-live="polite" aria-atomic="true">
            <FormattedMessage
              id="inspector.requests.requestWasMadeDescription"
              defaultMessage="{requestsCount, plural, one {# request was} other {# requests were} } made{failedRequests}"
              values={{
                requestsCount: this.state.requests.length,
                failedRequests:
                  failedCount > 0 ? (
                    <EuiTextColor color="danger">
                      <FormattedMessage
                        id="inspector.requests.requestWasMadeDescription.requestHadFailureText"
                        defaultMessage=", {failedCount} had a failure"
                        values={{ failedCount }}
                      />
                    </EuiTextColor>
                  ) : (
                    ''
                  ),
              }}
            />
          </p>
        </EuiText>
        <EuiSpacer size="xs" />
        {this.state.request && (
          <>
            <RequestSelector
              requests={this.state.requests}
              selectedRequest={this.state.request}
              onRequestChanged={this.selectRequest}
            />
            <EuiSpacer size="xs" />
          </>
        )}

        {this.state.request && this.state.request.description && (
          <EuiText size="xs">
            <p>{this.state.request.description}</p>
          </EuiText>
        )}

        {this.state.request && this.state.request.searchSessionId && (
          <EuiText size="xs">
            <p
              data-test-subj={'inspectorRequestSearchSessionId'}
              data-search-session-id={this.state.request.searchSessionId}
            >
              <FormattedMessage
                id="inspector.requests.searchSessionId"
                defaultMessage="Search session id: {searchSessionId}"
                values={{ searchSessionId: this.state.request.searchSessionId }}
              />
            </p>
          </EuiText>
        )}

        <EuiSpacer size="m" />

        {this.state.request && (
          <RequestDetails
            initialTabs={(this.props.options as RequestViewOptions | undefined)?.initialTabs}
            request={this.state.request}
          />
        )}
      </>
    );
  }
}
