import React, { useEffect } from 'react';
import { addEditFormStyle } from '../../../../../components/form-controls/formControl.override.styles';
import ActionBar from '../../../../../components/ActionBar';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import FunctionTestInput from './FunctionTestInput';
import FunctionTestOutput from './FunctionTestOutput';
import { InputFormValues, HttpMethods } from '../FunctionEditor.types';
import { Form, FormikProps, Formik, FormikActions } from 'formik';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';

export interface FunctionTestProps {
  run: (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => void;
  cancel: () => void;
  functionInfo: ArmObj<FunctionInfo>;
  reqBody: string;
  setReqBody: (reqBody: string) => void;
}

const pivotWrapper = style({
  paddingLeft: '8px',
});

const defaultInputFormValues: InputFormValues = {
  method: HttpMethods.get,
  queries: [],
  headers: [],
};

// TODO (krmitta): Add Content for Function test panel [WI: 5536379]
const FunctionTest: React.SFC<FunctionTestProps> = props => {
  const { t } = useTranslation();
  const { run, cancel, functionInfo, reqBody, setReqBody } = props;

  const getPivotTabId = (itemKey: string, index: number): string => {
    switch (itemKey) {
      case 'input':
        return 'function-test-input';
      case 'output':
        return 'function-test-output';
      default:
        return '';
    }
  };

  const initData = () => {
    try {
      const testData = JSON.parse(functionInfo.properties.test_data);
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
    } catch (err) {
      LogService.error(LogCategories.FunctionEdit, 'invalid-json', err);
    }
  };

  useEffect(() => {
    initData();
  }, []);
  return (
    <Formik
      initialValues={defaultInputFormValues}
      onSubmit={run}
      render={(formProps: FormikProps<InputFormValues>) => {
        const actionBarPrimaryButtonProps = {
          id: 'run',
          title: t('run'),
          onClick: formProps.submitForm,
          disable: false,
        };

        const actionBarSecondaryButtonProps = {
          id: 'cancel',
          title: t('cancel'),
          onClick: cancel,
          disable: false,
        };

        return (
          <Form className={addEditFormStyle}>
            <Pivot getTabId={getPivotTabId}>
              <PivotItem className={pivotWrapper} itemKey="input" linkText={t('functionTestInput')}>
                <FunctionTestInput {...formProps} functionInfo={functionInfo} body={reqBody} />
              </PivotItem>
              <PivotItem className={pivotWrapper} itemKey="output" linkText={t('functionTestOutput')}>
                {/* TODO (krmitta): Add responseCode and responsebody according to the output received*/}
                <FunctionTestOutput responseCode={200} responseBody={''} />
              </PivotItem>
            </Pivot>
            <ActionBar
              id="function-test-footer"
              primaryButton={actionBarPrimaryButtonProps}
              secondaryButton={actionBarSecondaryButtonProps}
            />
          </Form>
        );
      }}
    />
  );
};

export default FunctionTest;
