import React, { useContext, useState } from 'react';
import { settingsWrapper } from '../../AppSettingsForm';
import { Field, FormikProps } from 'formik';
import RadioButton from '../../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { PermissionsContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { Stack, Panel, PanelType } from 'office-ui-fabric-react';
import IconButton from '../../../../../components/IconButton/IconButton';
import EditClientExclusionPaths from './EditClientExclusionPaths';
import { AppSettingsFormValues } from '../../AppSettings.types';
const ClientCert: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { values, setFieldValue } = props;
  const { t } = useTranslation();
  const { app_write, editable } = useContext(PermissionsContext);
  const [showPanel, setShowPanel] = useState(false);
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
          component={RadioButton}
          label={t('requireIncomingClientCertificates')}
          disabled={!app_write || !editable}
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
              component={TextField}
              disabled
              placeholder={t('noExclusionRulesDefined')}
              label={t('certificateExlusionPaths')}
              id="incoming-client-certificate-exclusion-paths"
            />
            <Panel
              isOpen={showPanel}
              type={PanelType.medium}
              onDismiss={onCancel}
              headerText={t('certificateExlusionPaths')}
              closeButtonAriaLabel={t('close')}>
              <EditClientExclusionPaths
                clientExclusionPaths={values.site.properties.clientCertExclusionPaths}
                save={onSave}
                cancel={onCancel}
              />
            </Panel>
            <IconButton
              iconProps={{ iconName: 'Edit' }}
              id={`edit-client-cert-exclusion-paths`}
              ariaLabel={t('editCertificateExlusionPaths')}
              title={t('editCertificateExlusionPaths')}
              disabled={!app_write || !editable}
              onClick={openClientExclusionPathPane}
            />
          </Stack>
        )}
      </div>
    </>
  );
};

export default ClientCert;
