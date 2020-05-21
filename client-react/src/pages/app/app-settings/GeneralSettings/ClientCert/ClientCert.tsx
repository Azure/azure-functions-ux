import React, { useContext, useState } from 'react';
import { settingsWrapper } from '../../AppSettingsForm';
import { Field, FormikProps } from 'formik';
import RadioButtonNoFormik from '../../../../../components/form-controls/RadioButtonNoFormik';
import { useTranslation } from 'react-i18next';
import { PermissionsContext, SiteContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { Stack, PanelType, IChoiceGroupOption } from 'office-ui-fabric-react';
import IconButton from '../../../../../components/IconButton/IconButton';
import EditClientExclusionPaths from './EditClientExclusionPaths';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
import { ClientCertMode, Site } from '../../../../../models/site/site';
import { ArmObj } from '../../../../../models/arm-obj';

enum CompositeClientCertMode {
  Require = 'Require',
  Allow = 'Allow',
  Ignore = 'Ignore',
}

const ClientCert: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { values, setFieldValue, initialValues } = props;
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const [showPanel, setShowPanel] = useState(false);

  const onClientCertModeChange = (e: any, newValue: IChoiceGroupOption) => {
    switch (newValue.key) {
      case CompositeClientCertMode.Require:
        setFieldValue('site.properties.clientCertEnabled', true);
        setFieldValue('site.properties.clientCertMode', ClientCertMode.Required);
        break;
      case CompositeClientCertMode.Allow:
        setFieldValue('site.properties.clientCertEnabled', true);
        setFieldValue('site.properties.clientCertMode', ClientCertMode.Optional);
        break;
      case CompositeClientCertMode.Ignore:
        setFieldValue('site.properties.clientCertEnabled', false);
        break;
      default:
        setFieldValue('site.properties.clientCertEnabled', false);
        break;
    }
  };

  const getCompositeClientCertMode = (siteArm: ArmObj<Site>): CompositeClientCertMode => {
    if (siteArm.properties.clientCertEnabled) {
      return siteArm.properties.clientCertMode === ClientCertMode.Required
        ? CompositeClientCertMode.Require
        : CompositeClientCertMode.Allow;
    }
    return CompositeClientCertMode.Ignore;
  };

  const scenarioChecker = new ScenarioService(t);
  const clientCertEnabled = scenarioChecker.checkScenario(ScenarioIds.incomingClientCertEnabled, { site });
  const openClientExclusionPathPanel = () => {
    setShowPanel(true);
  };
  const onCancel = () => {
    setShowPanel(false);
  };
  const onSave = clientExclusionsPath => {
    setFieldValue('site.properties.clientCertExclusionPaths', clientExclusionsPath);
    setShowPanel(false);
  };
  return (
    <>
      <h3>{t('incomingClientCertificates')}</h3>
      <div className={settingsWrapper}>
        <RadioButtonNoFormik
          dirty={getCompositeClientCertMode(values.site) !== getCompositeClientCertMode(initialValues.site)}
          label={t('clientCertificateMode')}
          id="incoming-client-certificate-mode"
          ariaLabelledBy={`incoming-client-certificate-mode-label`}
          disabled={disableAllControls || clientCertEnabled.status === 'disabled'}
          upsellMessage={clientCertEnabled.status === 'disabled' ? clientCertEnabled.data : ''}
          selectedKey={getCompositeClientCertMode(values.site)}
          options={[
            {
              key: CompositeClientCertMode.Require,
              text: t('clientCertificateModeRequire'),
            },
            {
              key: CompositeClientCertMode.Allow,
              text: t('clientCertificateModeAllow'),
            },
            {
              key: CompositeClientCertMode.Ignore,
              text: t('clientCertificateModeIgnore'),
            },
          ]}
          onChange={onClientCertModeChange}
        />
        <Stack horizontal>
          <Field
            name="site.properties.clientCertExclusionPaths"
            dirty={values.site.properties.clientCertExclusionPaths !== initialValues.site.properties.clientCertExclusionPaths}
            component={TextField}
            disabled
            placeholder={t('noExclusionRulesDefined')}
            label={t('certificateExlusionPaths')}
            id="incoming-client-certificate-exclusion-paths"
          />
          <CustomPanel isOpen={showPanel} type={PanelType.medium} onDismiss={onCancel} headerText={t('certificateExlusionPaths')}>
            <EditClientExclusionPaths
              clientExclusionPaths={values.site.properties.clientCertExclusionPaths}
              save={onSave}
              cancel={onCancel}
            />
          </CustomPanel>
          <IconButton
            iconProps={{ iconName: 'Edit' }}
            id={`edit-client-cert-exclusion-paths`}
            ariaLabel={t('editCertificateExlusionPaths')}
            title={t('editCertificateExlusionPaths')}
            disabled={disableAllControls || !values.site.properties.clientCertEnabled}
            onClick={openClientExclusionPathPanel}
          />
        </Stack>
      </div>
    </>
  );
};

export default ClientCert;
