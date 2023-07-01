import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import RadioButton from '../../../../components/form-controls/RadioButton';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { TextFieldType } from '../../../../utils/CommonConstants';
import { DeploymentCenterContainerFormData, DeploymentCenterFieldProps, SettingOption } from '../DeploymentCenter.types';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getAppDockerWebhookUrl } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerContinuousDeploymentSettings: React.FC<DeploymentCenterFieldProps<
  DeploymentCenterContainerFormData
>> = () => {
  const { t } = useTranslation();
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  const continuousDeploymentOptions = [
    {
      key: SettingOption.on,
      text: t('on'),
    },
    {
      key: SettingOption.off,
      text: t('off'),
    },
  ];

  useEffect(() => {
    if (deploymentCenterPublishingContext && deploymentCenterPublishingContext.publishingCredentials) {
      setWebhookUrl(getAppDockerWebhookUrl(deploymentCenterPublishingContext.publishingCredentials));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterPublishingContext.publishingCredentials]);

  return (
    <>
      <Field
        id="continuous-deployment-option"
        label={t('continuousDeployment')}
        name="continuousDeploymentOption"
        component={RadioButton}
        options={continuousDeploymentOptions}
      />

      <TextFieldNoFormik
        id="continuous-deployment-webhook"
        label={t('containerWebhookUrl')}
        value={webhookUrl}
        copyButton={true}
        disabled={true}
        type={TextFieldType.password}
      />
    </>
  );
};

export default DeploymentCenterContainerContinuousDeploymentSettings;
