import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { ThemeContext } from '../../../../../ThemeContext';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { makeArmDeployment } from '../../../../../ApiHelpers/ArmHelper';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';

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
  const startupInfoContext = useContext(StartupInfoContext);
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
    const cdbTemplateObj = JSON.parse(cosmosDbTemplate);
    setSubmittedAccountName(cdbTemplateObj.name);

    // TODO: Testing ARM deployment
    // TODO: resources[] in highest level of form component
    const exampleFunctionTemplate = {
      name: 'NicsTestFunctionApp/TestFunc9923',
      type: 'Microsoft.Web/sites/functions',
      apiVersion: '2020-12-01',
      //kind: "string",
      properties: {
        //function_app_id: "NicsTestFunctionApp",
        //script_root_path_href: "string",
        //script_href: "string",
        //config_href: "string",
        //test_data_href: "string",
        //secrets_file_href: "string",
        //href: "string",
        config: {
          bindings: [
            {
              name: 'req',
              webHookType: 'genericJson',
              direction: 'in',
              type: 'httpTrigger',
            },
            {
              name: 'res',
              direction: 'out',
              type: 'http',
            },
          ],
        },
        files: {
          'index.js': `module.exports = async function (context, req) {
            context.log('JavaScript HTTP trigger function processed a request.');
        
            const name = (req.query.name || (req.body && req.body.name));
            const responseMessage = name
                ? "Hello, " + name + ". This HTTP triggered function executed successfully."
                : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
        
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: responseMessage
            };
          }`,
        },
        //test_data: "string",
        //invoke_url_template: "string",
        //language: "string",
        //isDisabled: false
      }, //,
      //resources: []
    };
    const armDeploymentResources = [cdbTemplateObj, exampleFunctionTemplate];
    const { subscription, resourceGroup } = new ArmResourceDescriptor(props.resourceId);
    makeArmDeployment(subscription, resourceGroup, armDeploymentResources);

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
      <h4 className={hdrStyle(theme)}>{t('documentDBCallout_newDocumentDBAccount')}</h4>
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

export default NewDocumentDBConnectionCallout;
