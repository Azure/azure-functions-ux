import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { ArmObj } from '../../../../models/arm-obj';
import { SourceControlProperties } from '../DeploymentCenter.types';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterCodeSourceReadOnly: React.FC<{}> = () => {
  return (
    <>
      <h1>Hello</h1>
      {/* <ReactiveFormControl id="deployment-center-source" label={t('deploymentCenterSettingsSourceLabel')}>
        <div>
          {`${gitHubUser.login}`}
          <Link
            key="deployment-center-github-change-account-link"
            onClick={authorizeGitHubAccount}
            className={additionalTextFieldControl}
            aria-label={t('deploymentCenterOAuthChangeAccount')}>
            {t('deploymentCenterOAuthChangeAccount')}
          </Link>
        </div>
      </ReactiveFormControl> */}
    </>
  );
};

export default DeploymentCenterCodeSourceReadOnly;
