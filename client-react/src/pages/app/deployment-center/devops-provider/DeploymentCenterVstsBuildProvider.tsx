import { Link, PrimaryButton } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { vstsDescriptionStyle } from '../DeploymentCenter.styles';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterVstsBuildProvider: React.FC = () => {
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const logClick = () => {
    portalContext.log(getTelemetryInfo('info', 'goToDevOpsPortal', 'clicked'));
  };

  const getVstsDocumentLink = () => {
    if (siteStateContext.isContainerApp) {
      return DeploymentCenterLinks.vstsWebAppContainerDeployment;
    } else if (siteStateContext.isLinuxApp) {
      return DeploymentCenterLinks.vstsWebAppLinuxDeployment;
    } else {
      return DeploymentCenterLinks.vstsWebAppWindowsDeployment;
    }
  };

  return (
    <>
      <div>
        <span id="deployment-center-vsts-desc">{t('deploymentCenterVstsDocsMessage')}</span>
        <Link
          id="deployment-center-vsts-desc-link"
          href={getVstsDocumentLink()}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-vsts-desc-link">
          {` ${t('learnMore')}`}
        </Link>
      </div>
      <div className={vstsDescriptionStyle}>
        <span id="deployment-center-vsts-message">{t('deploymentCenterVstsBuildMessage')}</span>
        <Link
          id="deployment-center-vsts-portal-link"
          href={DeploymentCenterLinks.azureDevOpsPortal}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-vsts-portal-link">
          {` ${t('azureDevOpsPortal')}`}
        </Link>
      </div>
      <div className={vstsDescriptionStyle}>
        <PrimaryButton
          id="deployment-center-vsts-get-started-message"
          href={DeploymentCenterLinks.vstsBuildGetStarted}
          target="_blank"
          onClick={logClick}
          aria-labelledby="deployment-center-vsts-get-started-message">
          {t('deploymentCenterVstsGetStarted')}
        </PrimaryButton>
      </div>
    </>
  );
};

export default DeploymentCenterVstsBuildProvider;
