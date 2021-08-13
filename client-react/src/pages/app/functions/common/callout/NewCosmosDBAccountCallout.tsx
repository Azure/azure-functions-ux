import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle } from './Callout.styles';
import { CosmosDbCreator, CreateCosmosDbFormValues } from '../../../../../fusion-controls/src/cosmos-db/CosmosDbCreator';
import { Formik, Form, FormikProps } from 'formik';
import { Link, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';

import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../ThemeContext';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { removeCurrentContainerArmTemplate, removeCurrentDatabaseArmTemplate } from '../CosmosDBComboBox';
import DocumentDBService from '../../../../../ApiHelpers/DocumentDBService';
import { buttonStyle } from '../../../../../components/ActionBar';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';

const hdrStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '18px',
    lineHeight: '24px',
    margin: '0',
    padding: '0',
    color: theme.semanticColors.textColor,
  });

const subtextStyle = (theme: ThemeExtended) =>
  style({
    marginTop: '24px',
    marginBottom: '7px',
    fontSize: '13px',
    lineHeight: '18px',
    color: theme.semanticColors.textColor,
  });

const buttonContainerStyle = style({
  marginTop: '25px',
});

const NewCosmosDBAccountCallout = props => {
  const [cosmosDbTemplate, setCosmosDbTemplate] = useState(''); // The current template (that's constantly updated on input change)
  const [submittedTemplate, setSubmittedTemplate] = useState(''); // The submitted template (used to guarantee consistency with the template that's being worked with)
  const [submittedAccountName, setSubmittedAccountName] = useState('');
  const theme = useContext(ThemeContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const {
    setIsDialogVisible,
    setArmResources,
    setNewDatabaseAccountName,
    setSelectedItem,
    setNewDbAcctType,
    form: formProps,
    armResources,
  } = props;

  const initialValues: CreateCosmosDbFormValues = {
    accountName: '',
    // apiType: 'coreSql',
  };

  const removeCurrentDatabaseAccountArmTemplate = () => {
    // Find and, if found, remove the template
    let modifiableArmResources = armResources;
    armResources.forEach((armRsc, index) => {
      if (armRsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
        modifiableArmResources.splice(index, 1);
        setArmResources(modifiableArmResources);
      }
    });
  };

  //Do what we need to with the finalized template string
  const handleSubmitTemplate = () => {
    setSubmittedTemplate(cosmosDbTemplate);
    const cdbTemplateObj = JSON.parse(cosmosDbTemplate);
    setSubmittedAccountName(cdbTemplateObj.name);
    setNewDatabaseAccountName(cdbTemplateObj.name);
    setNewDbAcctType(cdbTemplateObj.kind);
    setSelectedItem({ key: `${cdbTemplateObj.name}_DOCUMENTDB`, text: cdbTemplateObj.name, data: cdbTemplateObj.kind });

    if (!!setArmResources) {
      formProps.setStatus({ ...formProps.status, isNewDbAcct: true, isNewDatabase: true, isNewContainer: true });
      formProps.setFieldValue('databaseName', 'CosmosDatabase');
      formProps.setFieldValue('collectionName', 'CosmosContainer');

      removeCurrentDatabaseAccountArmTemplate();
      removeCurrentDatabaseArmTemplate(armResources, setArmResources);
      removeCurrentContainerArmTemplate(armResources, setArmResources);
      const newDatabaseTemplate = DocumentDBService.getNewDatabaseArmTemplate(
        'CosmosDatabase',
        formProps,
        armResources,
        cdbTemplateObj.name
      );
      const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(
        'CosmosContainer',
        formProps,
        armResources,
        cdbTemplateObj.name,
        'CosmosDatabase'
      );

      setArmResources(prevArmResources => [...prevArmResources, cdbTemplateObj, newDatabaseTemplate, newContainerTemplate]);
    }

    LogService.trackEvent(LogCategories.functionCreate, 'cosmosDbTemplate', 'Created new database account template');
  };

  const dismissCallout = () => {
    setIsDialogVisible(false);

    // Check submittedAccount name against Formik's current value and reset if different
    if (!!submittedTemplate && formRef.current.state.values.accountName !== submittedAccountName) {
      formRef.current.setFieldValue('accountName', submittedAccountName);
    }
  };

  // Semi-hacky fix to issue where callout would dismiss before state update, causing previous form values to be shown
  useEffect(dismissCallout, [submittedTemplate, submittedAccountName, formRef]);

  return (
    <div style={paddingSidesStyle}>
      <h4 className={hdrStyle(theme)}>{t('documentDBCallout_newDocumentDBAccount')}</h4>
      <div className={subtextStyle(theme)}>
        {t('documentDBCallout_newDocumentDBAccountSubtext') + ' '}
        <Link href="https://aka.ms/AAd5pzp" target="_blank" rel="noopener noreferrer">
          {t('documentDBCallout_newDocumentDBAccountLink')}
        </Link>
        .
      </div>

      <Formik initialValues={initialValues} onSubmit={handleSubmitTemplate} ref={formRef}>
        {(formProps: FormikProps<CreateCosmosDbFormValues>) => (
          <Form>
            <CosmosDbCreator
              setTemplate={setCosmosDbTemplate}
              template={cosmosDbTemplate}
              formProps={formProps}
              armAuthToken={startupInfoContext.token}
              language={startupInfoContext.effectiveLocale}
              horizontal
            />

            <div className={buttonContainerStyle}>
              <PrimaryButton
                className={buttonStyle(theme, true)}
                styles={{
                  root: [
                    {
                      marginLeft: '0px !important',
                    },
                  ],
                }}
                onClick={formProps.submitForm}
                disabled={
                  formProps.values.accountName === '' ||
                  formProps.errors.accountName !== undefined ||
                  formProps.values.accountName === submittedAccountName
                }>
                {t('create')}
              </PrimaryButton>

              <DefaultButton className={buttonStyle(theme, false)} onClick={dismissCallout}>
                {t('cancel')}
              </DefaultButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NewCosmosDBAccountCallout;
