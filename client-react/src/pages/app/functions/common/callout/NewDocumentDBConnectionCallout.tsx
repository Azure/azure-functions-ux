import React, { useState, useEffect, useRef } from 'react';
// import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle } from './Callout.styles';
import { CosmosDbCreator, CreateCosmosDbFormValues } from '../../../../../fusion-controls/src/cosmos-db/CosmosDbCreator';
import { Formik, Form, FormikProps } from 'formik';
import { Link, Stack, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';

import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { IButtonStyles } from 'office-ui-fabric-react';
import { mergeStyles } from '@uifabric/merge-styles';
import { useContext } from 'react';
import { ThemeContext } from '../../../../../ThemeContext';

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

const NewDocumentDBConnectionCallout = props => {
  const [cosmosDbTemplate, setCosmosDbTemplate] = useState(''); // The current template (that's constantly updated on input change)
  const [submittedTemplate, setSubmittedTemplate] = useState(''); // The submitted template (used to guarantee consistency with the template that's being worked with)
  const [submittedAccountName, setSubmittedAccountName] = useState('');
  const theme = useContext(ThemeContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const { setIsDialogVisible } = props;

  const initialValues: CreateCosmosDbFormValues = {
    accountName: '',
    // apiType: 'coreSql',
  };

  //Do what we need to with the finalized template string
  const handleSubmitTemplate = () => {
    setSubmittedTemplate(cosmosDbTemplate);
    setSubmittedAccountName(JSON.parse(cosmosDbTemplate).name);

    console.log(cosmosDbTemplate);
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
      <h4 className={hdrStyle(theme)}>{t('documentDBCallout_newDocumentDBConnection')}</h4>
      <div className={subtextStyle(theme)}>
        Selecting Create new here will create a new <strong>serverless</strong> account in the same <strong>Resource Group</strong> and{' '}
        <strong>location</strong>. For more options, go to{' '}
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
              location="east-us"
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
                Create
              </PrimaryButton>

              <DefaultButton className={buttonStyle(theme, false)} onClick={dismissCallout}>
                Cancel
              </DefaultButton>
            </Stack>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NewDocumentDBConnectionCallout;
