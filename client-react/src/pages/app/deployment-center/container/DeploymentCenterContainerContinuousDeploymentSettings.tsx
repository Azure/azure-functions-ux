import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData, ContinuousDeploymentOption } from '../DeploymentCenter.types';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { ActionButton } from 'office-ui-fabric-react';

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

  useEffect(() => {
    if (
      deploymentCenterPublishingContext &&
      deploymentCenterPublishingContext.publishingCredentials &&
      deploymentCenterPublishingContext.publishingCredentials.properties.scmUri
    ) {
      setWebhookUrl(`${deploymentCenterPublishingContext.publishingCredentials.properties.scmUri}/docker/hook`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterPublishingContext.publishingCredentials]);

  return (
    <>
      <Field
        id="continuous-deployment-enabled"
        label={t('continuousDeployment')}
        name="continuousDeployment"
        defaultSelectedKey={props.formProps.values.continuousDeploymentOption}
        component={RadioButton}
        options={[
          {
            key: ContinuousDeploymentOption.on,
            text: t('on'),
          },
          {
            key: ContinuousDeploymentOption.off,
            text: t('off'),
          },
        ]}
      />

      <TextFieldNoFormik
        id="continuous-deployment-webhook"
        label={t('containerWebhookUrl')}
        value={webhookUrl}
        copyButton={true}
        disabled={true}
        type={webhookFieldType}
        additionalControls={[
          <ActionButton
            id="continuous-deployment-webhook-visibility-toggle"
            key="continuous-deployment-webhook-visibility-toggle"
            className={additionalTextFieldControl}
            onClick={toggleShowWebhook}
            iconProps={{ iconName: webhookFieldType === 'password' ? 'RedEye' : 'Hide' }}>
            {webhookFieldType === 'password' ? t('show') : t('hide')}
          </ActionButton>,
        ]}
      />
    </>
  );
};

export default DeploymentCenterContainerContinuousDeploymentSettings;
