import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle } from './Callout.styles';
import { CosmosDbCreator, CreateCosmosDbFormValues } from '../../../../../fusion-controls/src/cosmos-db/CosmosDbCreator';
import { Formik, Form, FormikProps } from 'formik';
import { Link, Stack, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';

import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { IButtonStyles } from 'office-ui-fabric-react';
import { mergeStyles } from '@uifabric/merge-styles';
import { ThemeContext } from '../../../../../ThemeContext';
import { StartupInfoContext } from '../../../../../StartupInfoContext';

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

const primaryButtonStyle = (theme: ThemeExtended) => {
  const styles: IButtonStyles = {
    labelDisabled: {
      color: `${theme.semanticColors.primaryButtonTextDisabled} !important`,
    },
  };

  return styles;
};

const buttonStyle = (theme: ThemeExtended, isPrimary: boolean) =>
  mergeStyles({
    padding: '3px 20px',
    height: '24px',
    marginRight: `${isPrimary ? '8px' : '0'}`,
    color: `${isPrimary ? theme.semanticColors.primaryButtonText : theme.semanticColors.textColor}`,
    borderColor: `${isPrimary ? theme.semanticColors.primaryButtonBorder : theme.semanticColors.buttonBorder}`,
    selectors: {
      ':hover': {
        backgroundColor: `${
          isPrimary ? theme.semanticColors.primaryButtonBackgroundHovered : theme.semanticColors.buttonHovered
        } !important`,
        color: `${isPrimary ? theme.semanticColors.primaryButtonTextHovered : theme.semanticColors.textColor}`,
      },
      ':active': {
        color: `${isPrimary ? theme.semanticColors.primaryButtonTextPressed : theme.semanticColors.textColor}`,
      },
    },
  });

const NewCosmosDBAccountCallout = props => {
  const [cosmosDbTemplate, setCosmosDbTemplate] = useState(''); // The current template (that's constantly updated on input change)
  const [submittedTemplate, setSubmittedTemplate] = useState(''); // The submitted template (used to guarantee consistency with the template that's being worked with)
  const [submittedAccountName, setSubmittedAccountName] = useState('');
  const theme = useContext(ThemeContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const { setIsDialogVisible, setArmResources, setNewDatabaseAccountName } = props;

  const initialValues: CreateCosmosDbFormValues = {
    accountName: '',
    // apiType: 'coreSql',
  };

  //Do what we need to with the finalized template string
  const handleSubmitTemplate = () => {
    setSubmittedTemplate(cosmosDbTemplate);
    const cdbTemplateObj = JSON.parse(cosmosDbTemplate);
    setSubmittedAccountName(cdbTemplateObj.name);
    setNewDatabaseAccountName(cdbTemplateObj.name);

    if (!!setArmResources) {
      // TODO: may need to pass down the armResources state from FunctionCreateDataLoader to make sure nothing gets overwritten
      // Or just make sure we actually don't ever overwrite anything (Ex: user creates database/container resources then sets new account)
      setArmResources([cdbTemplateObj]); // I think at this point in the form we can safely assign the whole armResources array to this...
    }
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
        Create a new serverless account in the same Azure region and resource group as the function. For more options, go to{' '}
        <Link href="https://docs.microsoft.com/en-us/azure/cosmos-db/choose-api" target="_blank" rel="noopener noreferrer">
          Create Cosmos DB account
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
              location={'east-us'}
              language={startupInfoContext.effectiveLocale}
              horizontal
            />

            <Stack horizontal verticalAlign="center" className={buttonContainerStyle}>
              <PrimaryButton
                className={buttonStyle(theme, true)}
                onClick={formProps.submitForm}
                disabled={
                  formProps.values.accountName === '' ||
                  formProps.errors.accountName !== undefined ||
                  formProps.values.accountName === submittedAccountName
                }
                styles={primaryButtonStyle(theme)}>
                {t('create')}
              </PrimaryButton>

              <DefaultButton className={buttonStyle(theme, false)} onClick={dismissCallout}>
                {t('cancel')}
              </DefaultButton>
            </Stack>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NewCosmosDBAccountCallout;
