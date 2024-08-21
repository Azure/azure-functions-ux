import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData, ContinuousDeploymentOption } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getAppDockerWebhookUrl } from '../utility/DeploymentCenterUtility';
import { TextFieldType } from '../../../../utils/CommonConstants';

const DeploymentCenterContainerContinuousDeploymentSettings: React.FC<DeploymentCenterFieldProps<
  DeploymentCenterContainerFormData
>> = () => {
  const { t } = useTranslation();
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  const continuousDeploymentOptions = [
    {
      key: ContinuousDeploymentOption.on,
      text: t('on'),
    },
    {
      key: ContinuousDeploymentOption.off,
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
