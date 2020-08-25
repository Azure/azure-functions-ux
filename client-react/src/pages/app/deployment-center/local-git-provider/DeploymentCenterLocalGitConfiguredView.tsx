import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';

const DeploymentCenterLocalGitConfiguredView: React.FC<{}> = props => {
  const { t } = useTranslation();
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

  const getCloneUri = () => {
    if (
      deploymentCenterPublishingContext &&
      deploymentCenterPublishingContext.publishingCredentials &&
      deploymentCenterPublishingContext.publishingCredentials.properties &&
      deploymentCenterPublishingContext.publishingCredentials.name
    ) {
      const scmUri = deploymentCenterPublishingContext.publishingCredentials.properties.scmUri.split('@')[1];
      const siteName = deploymentCenterPublishingContext.publishingCredentials.name;

      return `https://${scmUri}:443/${siteName}.git`;
    } else {
      return t('deploymentCenterCodeLocalGitFetchCloneUriError');
    }
  };

  return (
    <>
      <h3>{t('deploymentCenterCodeLocalGitTitle')}</h3>

      <ReactiveFormControl id="deployment-center-localgit-clone-uri" label={t('deploymentCenterCodeLocalGitCloneUri')}>
        <div>{getCloneUri()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterLocalGitConfiguredView;
