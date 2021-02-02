import { Link, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterVstsBuildProvider: React.FC<{}> = props => {
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const logClick = () => {
    portalContext.log(getTelemetryInfo('info', 'goToDevOpsPortal', 'clicked'));
  };

  const getVstsDocumentLink = () => {
    if (siteStateContext.isContainerApp) {
      return DeploymentCenterLinks.vstsWebAppContainerDeployment;
    }
    return siteStateContext.isLinuxApp
      ? DeploymentCenterLinks.vstsWebAppLinuxDeployment
      : DeploymentCenterLinks.vstsWebAppWindowsDeployment;
  };

  return (
    <>
      <p>
        <span id="deployment-center-vsts-desc">{t('deploymentCenterVstsDocsMessage')}</span>
        <Link
          id="deployment-center-vsts-desc-link"
          href={getVstsDocumentLink()}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-vsts-desc-link">
          {` ${t('learnMore')}. `}
        </Link>
      </p>
      <p className={titleWithPaddingStyle} id="deployment-center-vsts-message">
        {t('deploymentCenterVstsBuildMessage')}
      </p>

      <PrimaryButton
        id="deployment-center-vsts-get-started-message"
        href={DeploymentCenterLinks.vstsBuildGetStarted}
        target="_blank"
        onClick={logClick}
        aria-labelledby="deployment-center-vsts-get-started-message">
        {t('deploymentCenterVstsGetStarted')}
      </PrimaryButton>
    </>
  );
};

export default DeploymentCenterVstsBuildProvider;
