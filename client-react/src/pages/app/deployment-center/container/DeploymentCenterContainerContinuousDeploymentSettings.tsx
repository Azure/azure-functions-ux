import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData, ContinuousDeploymentOption } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { ActionButton } from 'office-ui-fabric-react';
import { getAppDockerWebhookUrl } from '../utility/DeploymentCenterUtility';

type WebhookFieldType = 'password' | undefined;

const DeploymentCenterContainerContinuousDeploymentSettings: React.FC<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData>
> = props => {
  const { t } = useTranslation();
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const [webhookFieldType, setWebhookFieldType] = useState<WebhookFieldType>('password');
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  const toggleShowWebhook = () => {
    setWebhookFieldType(!webhookFieldType ? 'password' : undefined);
  };

  const additionalWebhookControls = () => {
    return [
      <ActionButton
        id="continuous-deployment-webhook-visibility-toggle"
        key="continuous-deployment-webhook-visibility-toggle"
        className={additionalTextFieldControl}
        onClick={toggleShowWebhook}
        iconProps={{ iconName: webhookFieldType === 'password' ? 'RedEye' : 'Hide' }}>
        {webhookFieldType === 'password' ? t('show') : t('hide')}
      </ActionButton>,
    ];
  };

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
        type={webhookFieldType}
        additionalControls={additionalWebhookControls()}
      />
    </>
  );
};

export default DeploymentCenterContainerContinuousDeploymentSettings;
