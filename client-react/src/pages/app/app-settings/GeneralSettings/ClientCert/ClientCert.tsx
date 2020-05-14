import React, { useContext, useState } from 'react';
import { settingsWrapper } from '../../AppSettingsForm';
import { Field, FormikProps } from 'formik';
import RadioButton from '../../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { PermissionsContext, SiteContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { Stack, PanelType } from 'office-ui-fabric-react';
import IconButton from '../../../../../components/IconButton/IconButton';
import EditClientExclusionPaths from './EditClientExclusionPaths';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
const ClientCert: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { values, setFieldValue, initialValues } = props;
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const [showPanel, setShowPanel] = useState(false);

  const scenarioChecker = new ScenarioService(t);
  const clientCertEnabled = scenarioChecker.checkScenario(ScenarioIds.incomingClientCertEnabled, { site });
  const openClientExclusionPathPane = () => {
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
        <Field
          name="site.properties.clientCertEnabled"
          dirty={values.site.properties.clientCertEnabled !== initialValues.site.properties.clientCertEnabled}
          component={RadioButton}
          label={t('requireIncomingClientCertificates')}
          disabled={disableAllControls || clientCertEnabled.status === 'disabled'}
          upsellMessage={clientCertEnabled.status === 'disabled' ? clientCertEnabled.data : ''}
          id="incoming-client-certificate-enabled"
          options={[
            {
              key: true,
              text: t('on'),
            },
            {
              key: false,
              text: t('off'),
            },
          ]}
        />
        {values.site.properties.clientCertEnabled && (
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
              disabled={disableAllControls}
              onClick={openClientExclusionPathPane}
            />
          </Stack>
        )}
      </div>
    </>
  );
};

export default ClientCert;
