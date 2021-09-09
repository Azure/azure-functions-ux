import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterGitHubAccount from './DeploymentCenterGitHubAccount';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { SiteStateContext } from '../../../../SiteState';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { Dialog, DialogFooter, DialogType, MessageBar, MessageBarType, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';

const DeploymentCenterGitHubProvider: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);
  const [hideDialog, toggleHideDialog] = useState(true);
  const [hideMessage, toggleHideMessage] = useState(false);

  const {
    formProps,
    accountUser,
    organizationOptions,
    repositoryOptions,
    branchOptions,
    loadingOrganizations,
    loadingRepositories,
    loadingBranches,
    hasDeprecatedToken,
    updateTokenSuccess,
    resetToken,
    onSearchTermChange,
  } = props;

  const deprecatedTokensBanner = hasDeprecatedToken ? (
    <div id="deployment-center-deprecated-token-banner" className={deploymentCenterInfoBannerDiv} onClick={() => toggleHideDialog(false)}>
      <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
        {`${t('deploymentCenterDeprecatedTokenWarningMessage')}`}
      </MessageBar>
    </div>
  ) : (
    <></>
  );

  const deprecatedTokensDialog = hasDeprecatedToken ? (
    <div>
      <Dialog
        hidden={hideDialog}
        onDismiss={() => toggleHideDialog(true)}
        dialogContentProps={{
          type: DialogType.normal,
          title: `${t('deploymentCenterDeprecatedTokenDialogTitle')}`,
          subText: `${t('deploymentCenterDeprecatedTokenDialogBody')}`,
        }}>
        <DialogFooter>
          <PrimaryButton
            onClick={() => {
              toggleHideDialog(true);
              resetToken ? resetToken() : () => {};
            }}
            text={`${t('update')}`}
          />
          <DefaultButton onClick={() => toggleHideDialog(true)} text={`${t('cancel')}`} />
        </DialogFooter>
      </Dialog>
    </div>
  ) : (
    <></>
  );

  const updateTokenSuccessBanner = updateTokenSuccess ? (
    <div id="deployment-center-update-token-success-banner" className={deploymentCenterInfoBannerDiv} hidden={hideMessage}>
      <MessageBar messageBarType={MessageBarType.success} isMultiline={false} onDismiss={() => toggleHideMessage(true)}>
        {`${t('deploymentCenterUpdateTokenSuccessMessage')}`}
      </MessageBar>
    </div>
  ) : (
    <></>
  );

  return (
    <>
      <h3>{siteStateContext.isContainerApp ? t('deploymentCenterContainerGitHubActionsTitle') : t('deploymentCenterCodeGitHubTitle')}</h3>

      <DeploymentCenterGitHubAccount {...props} />

      {deprecatedTokensBanner}
      {deprecatedTokensDialog}
      {updateTokenSuccessBanner}

      {accountUser && accountUser.login && (
        <>
          <Field
            id="deployment-center-settings-organization-option"
            label={t('deploymentCenterOAuthOrganization')}
            placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
            name="org"
            defaultSelectedKey={formProps.values.org}
            component={ComboBox}
            allowFreeform
            autoComplete="on"
            displayInVerticalLayout={true}
            options={organizationOptions}
            required={true}
            isLoading={loadingOrganizations}
          />
          <Field
            id="deployment-center-settings-repository-option"
            label={t('deploymentCenterOAuthRepository')}
            placeholder={t('deploymentCenterOAuthRepositoryPlaceholder')}
            name="repo"
            component={ComboBox}
            allowFreeform
            autoComplete="off"
            displayInVerticalLayout={true}
            options={repositoryOptions}
            defaultSelectedKey={formProps.values.repo}
            required={true}
            isLoading={loadingRepositories}
            autofill={{
              onInputValueChange: (newValue: string) => {
                onSearchTermChange(newValue);
              },
            }}
          />
          <Field
            id="deployment-center-settings-branch-option"
            label={t('deploymentCenterOAuthBranch')}
            placeholder={t('deploymentCenterOAuthBranchPlaceholder')}
            name="branch"
            component={ComboBox}
            allowFreeform
            autoComplete="on"
            displayInVerticalLayout={true}
            options={branchOptions}
            defaultSelectedKey={formProps.values.branch}
            required={true}
            isLoading={loadingBranches}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterGitHubProvider;
