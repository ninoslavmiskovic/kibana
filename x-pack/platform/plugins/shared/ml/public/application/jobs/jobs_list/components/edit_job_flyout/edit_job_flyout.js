/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { cloneDeep, isEqual, pick } from 'lodash';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { withKibana } from '@kbn/kibana-react-plugin/public';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabbedContent,
  EuiConfirmModal,
  EuiSpacer,
  htmlIdGenerator,
} from '@elastic/eui';

import { EditJobDetailsTab, EditDetectorsTab, EditDatafeedTab } from './tabs';
import { saveJob } from './edit_utils';
import { loadFullJob } from '../utils';
import { validateModelMemoryLimit, validateGroupNames } from '../validate_job';
import { toastNotificationServiceProvider } from '../../../../services/toast_notification_service';
import { XJson } from '@kbn/es-ui-shared-plugin/public';
import { DATAFEED_STATE, JOB_STATE } from '../../../../../../common/constants/states';
import { CustomUrlsWrapper, isValidCustomUrls } from '../../../../components/custom_urls';
import { isManagedJob } from '../../../jobs_utils';
import { ManagedJobsWarningCallout } from '../confirm_modals/managed_jobs_warning_callout';

const { collapseLiteralStrings } = XJson;

export class EditJobFlyoutUI extends Component {
  _initialJobFormState = null;

  constructor(props, constructorContext) {
    super(props, constructorContext);

    this.state = {
      job: {},
      hasDatafeed: false,
      datafeedRunning: false,
      isFlyoutVisible: false,
      isConfirmationModalVisible: false,
      jobDescription: '',
      jobGroups: [],
      jobModelMemoryLimit: '',
      jobModelSnapshotRetentionDays: 10,
      jobDailyModelSnapshotRetentionAfterDays: 10,
      jobDetectors: [],
      jobDetectorDescriptions: [],
      jobCustomUrls: [],
      datafeedQuery: '',
      datafeedQueryDelay: '',
      datafeedFrequency: '',
      datafeedScrollSize: '',
      jobModelMemoryLimitValidationError: '',
      jobGroupsValidationError: '',
      isValidJobDetails: true,
      isValidJobCustomUrls: true,
    };

    this.refreshJobs = this.props.refreshJobs;
  }

  componentDidMount() {
    if (typeof this.props.setShowFunction === 'function') {
      this.props.setShowFunction(this.showFlyout);
    }
  }

  componentWillUnmount() {
    if (typeof this.props.unsetShowFunction === 'function') {
      this.props.unsetShowFunction();
    }
  }

  closeFlyout = (isConfirmed = false) => {
    if (this.containsUnsavedChanges() && !isConfirmed) {
      this.setState({ isConfirmationModalVisible: true });
      return;
    }
    this.setState({ isConfirmationModalVisible: false });
    this.setState({ isFlyoutVisible: false });
  };

  /**
   * Checks if there are any unsaved changes.
   * @returns {boolean}
   */
  containsUnsavedChanges() {
    return !isEqual(
      this._initialJobFormState,
      pick(this.state, [
        'jobDescription',
        'jobGroups',
        'jobModelMemoryLimit',
        'jobModelSnapshotRetentionDays',
        'jobDailyModelSnapshotRetentionAfterDays',
        'jobCustomUrls',
        'jobDetectors',
        'jobDetectorDescriptions',
        'jobBucketSpan',
        'datafeedQuery',
        'datafeedQueryDelay',
        'datafeedFrequency',
        'datafeedScrollSize',
      ])
    );
  }

  showFlyout = (jobLite) => {
    const hasDatafeed = jobLite.hasDatafeed;
    loadFullJob(this.props.kibana.services.mlServices.mlApi, jobLite.id)
      .then((job) => {
        this.extractJob(job, hasDatafeed);
        this.setState({
          job,
          isFlyoutVisible: true,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  extractInitialJobFormState(job, hasDatafeed) {
    const mml =
      job.analysis_limits && job.analysis_limits.model_memory_limit
        ? job.analysis_limits.model_memory_limit
        : '';

    const modelSnapshotRetentionDays =
      job.model_snapshot_retention_days !== undefined ? job.model_snapshot_retention_days : 10;

    const dailyModelSnapshotRetentionAfterDays =
      job.daily_model_snapshot_retention_after_days !== undefined
        ? job.daily_model_snapshot_retention_after_days
        : modelSnapshotRetentionDays;

    const detectors =
      job.analysis_config && job.analysis_config.detectors
        ? [...job.analysis_config.detectors]
        : [];

    const bucketSpan = job.analysis_config ? job.analysis_config.bucket_span : '';

    const datafeedConfig = { ...job.datafeed_config };
    const frequency = datafeedConfig.frequency !== undefined ? datafeedConfig.frequency : '';
    const customUrls =
      job.custom_settings && job.custom_settings.custom_urls
        ? [...job.custom_settings.custom_urls]
        : [];

    this._initialJobFormState = Object.freeze({
      jobDescription: job.description,
      jobGroups: job.groups !== undefined ? job.groups : [],
      jobModelMemoryLimit: mml,
      jobModelSnapshotRetentionDays: modelSnapshotRetentionDays,
      jobDailyModelSnapshotRetentionAfterDays: dailyModelSnapshotRetentionAfterDays,
      jobDetectors: detectors,
      jobDetectorDescriptions: detectors.map((d) => d.detector_description),
      jobBucketSpan: bucketSpan,
      jobCustomUrls: customUrls,
      datafeedQuery: hasDatafeed ? JSON.stringify(datafeedConfig.query, null, 2) : '',
      datafeedQueryDelay: hasDatafeed ? datafeedConfig.query_delay : '',
      datafeedFrequency: hasDatafeed ? frequency : '',
      datafeedScrollSize: hasDatafeed ? +datafeedConfig.scroll_size : null,
    });
  }

  extractJob(job, hasDatafeed) {
    this.extractInitialJobFormState(job, hasDatafeed);
    const datafeedRunning = hasDatafeed && job.datafeed_config.state !== DATAFEED_STATE.STOPPED;
    const jobClosed = job.state === JOB_STATE.CLOSED;

    this.setState({
      job,
      hasDatafeed,
      datafeedRunning,
      jobClosed,
      jobModelMemoryLimitValidationError: '',
      jobGroupsValidationError: '',
      ...cloneDeep(this._initialJobFormState),
    });
  }

  setJobDetails = (jobDetails) => {
    let { jobModelMemoryLimitValidationError, jobGroupsValidationError } = this.state;

    if (jobDetails.jobModelMemoryLimit !== undefined) {
      jobModelMemoryLimitValidationError = validateModelMemoryLimit(
        jobDetails.jobModelMemoryLimit
      ).message;
    }

    const mlApi = this.props.kibana.services.mlServices.mlApi;

    if (jobDetails.jobGroups !== undefined) {
      jobGroupsValidationError = validateGroupNames(jobDetails.jobGroups).message;
      if (jobGroupsValidationError === '') {
        mlApi.jobs.jobsExist(jobDetails.jobGroups, true).then((resp) => {
          const groups = Object.values(resp);
          const valid = groups.some((g) => g.exists === true && g.isGroup === false) === false;
          if (valid === false) {
            this.setState({
              jobGroupsValidationError: i18n.translate(
                'xpack.ml.jobsList.editJobFlyout.groupsAndJobsHasSameIdErrorMessage',
                {
                  defaultMessage:
                    'A job with this ID already exists. Groups and jobs cannot use the same ID.',
                }
              ),
              isValidJobDetails: false,
            });
          }
        });
      }
    }

    const isValidJobDetails =
      jobModelMemoryLimitValidationError === '' && jobGroupsValidationError === '';

    this.setState({
      ...jobDetails,
      jobModelMemoryLimitValidationError,
      jobGroupsValidationError,
      isValidJobDetails,
    });
  };

  setDetectorDescriptions = (jobDetectorDescriptions) => {
    this.setState({
      ...jobDetectorDescriptions,
    });
  };

  setDatafeed = (datafeed) => {
    this.setState({
      ...datafeed,
    });
  };

  setCustomUrls = (jobCustomUrls) => {
    const isValidJobCustomUrls = isValidCustomUrls(jobCustomUrls);
    this.setState({
      jobCustomUrls,
      isValidJobCustomUrls,
    });
  };

  save = () => {
    const newJobData = {
      description: this.state.jobDescription,
      groups: this.state.jobGroups,
      mml: this.state.jobModelMemoryLimit,
      modelSnapshotRetentionDays: this.state.jobModelSnapshotRetentionDays,
      dailyModelSnapshotRetentionAfterDays: this.state.jobDailyModelSnapshotRetentionAfterDays,
      detectorDescriptions: this.state.jobDetectorDescriptions,
      datafeedQuery: collapseLiteralStrings(this.state.datafeedQuery),
      datafeedQueryDelay: this.state.datafeedQueryDelay,
      datafeedFrequency: this.state.datafeedFrequency,
      datafeedScrollSize: this.state.datafeedScrollSize,
      customUrls: this.state.jobCustomUrls,
    };

    const mlApi = this.props.kibana.services.mlServices.mlApi;
    const { toasts } = this.props.kibana.services.notifications;
    const toastNotificationService = toastNotificationServiceProvider(toasts);

    saveJob(mlApi, this.state.job, newJobData)
      .then(() => {
        toasts.addSuccess(
          i18n.translate('xpack.ml.jobsList.editJobFlyout.changesSavedNotificationMessage', {
            defaultMessage: 'Changes to {jobId} saved',
            values: {
              jobId: this.state.job.job_id,
            },
          })
        );
        this.refreshJobs();
        this.closeFlyout(true);
      })
      .catch((error) => {
        console.error(error);
        toastNotificationService.displayErrorToast(
          error,
          i18n.translate('xpack.ml.jobsList.editJobFlyout.changesNotSavedNotificationMessage', {
            defaultMessage: 'Could not save changes to {jobId}',
            values: {
              jobId: this.state.job.job_id,
            },
          })
        );
      });
  };

  render() {
    const confirmModalTitleId = htmlIdGenerator()('confirmModalTitle');

    let flyout;
    let confirmationModal;

    if (this.state.isFlyoutVisible) {
      const {
        job,
        jobDescription,
        jobGroups,
        jobModelMemoryLimit,
        jobModelSnapshotRetentionDays,
        jobDailyModelSnapshotRetentionAfterDays,
        jobDetectors,
        jobDetectorDescriptions,
        jobBucketSpan,
        jobCustomUrls,
        datafeedQuery,
        datafeedQueryDelay,
        datafeedFrequency,
        datafeedScrollSize,
        jobGroupsValidationError,
        jobModelMemoryLimitValidationError,
        isValidJobDetails,
        isValidJobCustomUrls,
        datafeedRunning,
        jobClosed,
      } = this.state;

      const tabs = [
        {
          id: 'job-details',
          'data-test-subj': 'mlEditJobFlyout-jobDetails',
          name: i18n.translate('xpack.ml.jobsList.editJobFlyout.jobDetailsTitle', {
            defaultMessage: 'Job details',
          }),
          content: (
            <EditJobDetailsTab
              euiTheme={this.props.euiTheme}
              jobClosed={jobClosed}
              datafeedRunning={datafeedRunning}
              jobDescription={jobDescription}
              jobGroups={jobGroups}
              jobModelMemoryLimit={jobModelMemoryLimit}
              jobModelSnapshotRetentionDays={jobModelSnapshotRetentionDays}
              jobDailyModelSnapshotRetentionAfterDays={jobDailyModelSnapshotRetentionAfterDays}
              setJobDetails={this.setJobDetails}
              jobGroupsValidationError={jobGroupsValidationError}
              jobModelMemoryLimitValidationError={jobModelMemoryLimitValidationError}
            />
          ),
        },
        {
          id: 'detectors',
          'data-test-subj': 'mlEditJobFlyout-detectors',
          name: i18n.translate('xpack.ml.jobsList.editJobFlyout.detectorsTitle', {
            defaultMessage: 'Detectors',
          }),
          content: (
            <EditDetectorsTab
              jobDetectors={jobDetectors}
              jobDetectorDescriptions={jobDetectorDescriptions}
              setDetectorDescriptions={this.setDetectorDescriptions}
            />
          ),
        },
        {
          id: 'datafeed',
          'data-test-subj': 'mlEditJobFlyout-datafeed',
          name: i18n.translate('xpack.ml.jobsList.editJobFlyout.datafeedTitle', {
            defaultMessage: 'Datafeed',
          }),
          content: (
            <EditDatafeedTab
              datafeedQuery={datafeedQuery}
              datafeedQueryDelay={datafeedQueryDelay}
              datafeedFrequency={datafeedFrequency}
              datafeedScrollSize={datafeedScrollSize}
              jobBucketSpan={jobBucketSpan}
              setDatafeed={this.setDatafeed}
              datafeedRunning={datafeedRunning}
            />
          ),
        },
        {
          id: 'custom-urls',
          'data-test-subj': 'mlEditJobFlyout-customUrls',
          name: i18n.translate('xpack.ml.jobsList.editJobFlyout.customUrlsTitle', {
            defaultMessage: 'Custom URLs',
          }),
          content: (
            <CustomUrlsWrapper
              job={job}
              jobCustomUrls={jobCustomUrls}
              setCustomUrls={this.setCustomUrls}
            />
          ),
        },
      ];

      flyout = (
        <EuiFlyout
          onClose={() => {
            this.closeFlyout();
          }}
          size="m"
          data-test-subj="mlJobEditFlyout"
        >
          <EuiFlyoutHeader>
            <EuiTitle>
              <h2>
                <FormattedMessage
                  id="xpack.ml.jobsList.editJobFlyout.pageTitle"
                  defaultMessage="Edit {jobId}"
                  values={{ jobId: job.job_id }}
                />
              </h2>
            </EuiTitle>

            {isManagedJob(job) ? (
              <>
                <EuiSpacer size="s" />
                <ManagedJobsWarningCallout
                  jobsCount={1}
                  action={i18n.translate(
                    'xpack.ml.jobsList.editJobModal.editManagedJobDescription',
                    {
                      defaultMessage: 'editing',
                    }
                  )}
                />
              </>
            ) : null}
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} onTabClick={() => {}} />
          </EuiFlyoutBody>
          <EuiFlyoutFooter>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  iconType="cross"
                  onClick={() => {
                    this.closeFlyout();
                  }}
                  flush="left"
                  data-test-subj="mlEditJobFlyoutCloseButton"
                >
                  <FormattedMessage
                    id="xpack.ml.jobsList.editJobFlyout.closeButtonLabel"
                    defaultMessage="Close"
                  />
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={this.save}
                  fill
                  isDisabled={isValidJobDetails === false || isValidJobCustomUrls === false}
                  data-test-subj="mlEditJobFlyoutSaveButton"
                >
                  <FormattedMessage
                    id="xpack.ml.jobsList.editJobFlyout.saveButtonLabel"
                    defaultMessage="Save"
                  />
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlyout>
      );
    }

    if (this.state.isConfirmationModalVisible) {
      confirmationModal = (
        <EuiConfirmModal
          aria-labelledby={confirmModalTitleId}
          title={i18n.translate('xpack.ml.jobsList.editJobFlyout.unsavedChangesDialogTitle', {
            defaultMessage: 'Save changes before leaving?',
          })}
          titleProps={{ id: confirmModalTitleId }}
          onCancel={() => this.closeFlyout(true)}
          onConfirm={() => this.save()}
          cancelButtonText={i18n.translate(
            'xpack.ml.jobsList.editJobFlyout.leaveAnywayButtonLabel',
            { defaultMessage: 'Leave anyway' }
          )}
          confirmButtonText={i18n.translate(
            'xpack.ml.jobsList.editJobFlyout.saveChangesButtonLabel',
            { defaultMessage: 'Save changes' }
          )}
          defaultFocusedButton="confirm"
        >
          <p>
            <FormattedMessage
              id="xpack.ml.jobsList.editJobFlyout.unsavedChangesDialogMessage"
              defaultMessage="If you don't save, your changes will be lost."
            />
          </p>
        </EuiConfirmModal>
      );
    }

    {
      return (
        <div>
          {flyout}
          {confirmationModal}
        </div>
      );
    }
  }
}

EditJobFlyoutUI.propTypes = {
  euiTheme: PropTypes.object.isRequired,
  setShowFunction: PropTypes.func.isRequired,
  unsetShowFunction: PropTypes.func.isRequired,
  refreshJobs: PropTypes.func.isRequired,
  allJobIds: PropTypes.array.isRequired,
};

export const EditJobFlyout = withKibana(EditJobFlyoutUI);
