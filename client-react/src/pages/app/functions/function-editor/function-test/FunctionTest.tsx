import React, { useEffect, useState } from 'react';
import { addEditFormStyle } from '../../../../../components/form-controls/formControl.override.styles';
import ActionBar, { StatusMessage } from '../../../../../components/ActionBar';
import { useTranslation } from 'react-i18next';
import FunctionTestInput from './FunctionTestInput';
import FunctionTestOutput from './FunctionTestOutput';
import { InputFormValues, HttpMethods, ResponseContent, PivotType } from '../FunctionEditor.types';
import { Form, FormikProps, Formik, FormikActions } from 'formik';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { functionTestBodyStyle } from './FunctionTest.styles';
import { MessageBarType } from 'office-ui-fabric-react';

export interface FunctionTestProps {
  run: (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => void;
  cancel: () => void;
  functionInfo: ArmObj<FunctionInfo>;
  reqBody: string;
  setReqBody: (reqBody: string) => void;
  selectedPivotTab: PivotType;
  functionRunning: boolean;
  responseContent?: ResponseContent;
}

const defaultInputFormValues: InputFormValues = {
  method: HttpMethods.get,
  queries: [],
  headers: [],
};

// TODO (krmitta): Add Content for Function test panel [WI: 5536379]
const FunctionTest: React.SFC<FunctionTestProps> = props => {
  const { t } = useTranslation();
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(undefined);

  const { run, cancel, functionInfo, reqBody, setReqBody, responseContent, selectedPivotTab, functionRunning } = props;

  const errorMessage = {
    message: t('requiredField_validationMessage'),
    level: MessageBarType.error,
  };

  const validateForm = (values: InputFormValues) => {
    const emptyQueries = values.queries.filter(q => !q.name || !q.value);
    setStatusMessage(undefined);

    if (emptyQueries.length > 0) {
      setStatusMessage(errorMessage);
    }
    const emptyHeaders = values.headers.filter(h => !h.name || !h.value);
    if (emptyHeaders.length > 0) {
      setStatusMessage(errorMessage);
    }
  };

  const onRequestBodyChange = (newValue, event) => {
    setReqBody(newValue);
  };

  useEffect(() => {
    defaultInputFormValues.headers = [];
    defaultInputFormValues.queries = [];
    let testData;
    try {
      testData = JSON.parse(functionInfo.properties.test_data);
      if (!testData.headers) {
        testData = { body: functionInfo.properties.test_data, method: HttpMethods.post };
      }
    } catch (err) {
      LogService.error(LogCategories.FunctionEdit, 'invalid-json', err);
    }
    if (!!testData) {
      if (!!testData.body) {
        setReqBody(testData.body);
      }
      if (!!testData.method) {
        defaultInputFormValues.method = testData.method;
      }
      if (!!testData.queryStringParams) {
        const queryParameters = testData.queryStringParams;
        for (const parameters of queryParameters) {
          defaultInputFormValues.queries.push({ name: parameters.name, value: parameters.value });
        }
      }
      if (!!testData.headers) {
        const headers = testData.headers;
        for (const header of headers) {
          defaultInputFormValues.headers.push({ name: header.name, value: header.value });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Formik
      initialValues={defaultInputFormValues}
      onSubmit={run}
      validate={validateForm}
      render={(formProps: FormikProps<InputFormValues>) => {
        const actionBarPrimaryButtonProps = {
          id: 'run',
          title: t('run'),
          onClick: formProps.submitForm,
          disable: !!statusMessage,
        };

        const actionBarSecondaryButtonProps = {
          id: 'cancel',
          title: t('cancel'),
          onClick: cancel,
          disable: false,
        };

        return (
          <Form className={addEditFormStyle}>
            <div className={functionTestBodyStyle}>
              {selectedPivotTab === PivotType.input && (
                <FunctionTestInput {...formProps} functionInfo={functionInfo} body={reqBody} onRequestBodyChange={onRequestBodyChange} />
              )}
              {selectedPivotTab === PivotType.output && <FunctionTestOutput responseContent={responseContent} />}
            </div>
            <ActionBar
              id="function-test-footer"
              primaryButton={actionBarPrimaryButtonProps}
              secondaryButton={actionBarSecondaryButtonProps}
              overlay={functionRunning}
              statusMessage={statusMessage}
            />
          </Form>
        );
      }}
    />
  );
};

export default FunctionTest;
