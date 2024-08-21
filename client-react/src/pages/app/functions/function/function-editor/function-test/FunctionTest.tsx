import React, { useEffect, useState, useContext } from 'react';
import { addEditFormStyle } from '../../../../../../components/form-controls/formControl.override.styles';
import ActionBar, { StatusMessage } from '../../../../../../components/ActionBar';
import { useTranslation } from 'react-i18next';
import FunctionTestInput from './FunctionTestInput';
import FunctionTestOutput from './FunctionTestOutput';
import { InputFormValues, HttpMethods, ResponseContent, PivotType, UrlObj, urlParameterRegExp } from '../FunctionEditor.types';
import { Form, FormikProps, Formik, FormikActions } from 'formik';
import { ArmObj } from '../../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { functionTestBodyStyle } from './FunctionTest.styles';
import { MessageBarType, Pivot, PivotItem } from '@fluentui/react';
import { ValidationRegex } from '../../../../../../utils/constants/ValidationRegex';
import CustomBanner from '../../../../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../../../../utils/FwLinks';
import { FunctionEditorContext } from '../FunctionEditorDataLoader';
import { CommonConstants, OverflowBehavior } from '../../../../../../utils/CommonConstants';
import Url from '../../../../../../utils/url';

export interface FunctionTestProps {
  run: (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => void;
  close: () => void;
  functionInfo: ArmObj<FunctionInfo>;
  reqBody: string;
  setReqBody: (reqBody: string) => void;
  functionRunning: boolean;
  urlObjs: UrlObj[];
  getFunctionUrl: (key?: string) => string;
  addCorsRule: (corsRule: string) => void;
  xFunctionKey?: string;
  responseContent?: ResponseContent;
  testData?: string;
  enablePortalCall?: boolean;
  addingCorsRules?: boolean;
}

// TODO (krmitta): Add Content for Function test panel [WI: 5536379]
const FunctionTest: React.SFC<FunctionTestProps> = props => {
  const { t } = useTranslation();
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(undefined);
  const [defaultInputFormValues, setDefaultInputFormValues] = useState<InputFormValues>({
    method: HttpMethods.get,
    queries: [],
    headers: [],
  });
  const [selectedPivotTab, setSelectedPivotTab] = useState(PivotType.input);

  const {
    run,
    close,
    functionInfo,
    reqBody,
    setReqBody,
    responseContent,
    functionRunning,
    testData,
    urlObjs,
    xFunctionKey,
    getFunctionUrl,
    addCorsRule,
    enablePortalCall,
    addingCorsRules,
  } = props;

  const errorMessage = {
    message: t('validField_validationMessage'),
    level: MessageBarType.error,
  };

  const functionEditorContext = useContext(FunctionEditorContext);

  const isHttpOrWebHookFunction = functionEditorContext.isHttpOrWebHookFunction(functionInfo);

  const validateForm = (values: InputFormValues) => {
    const invalidQueries = values.queries.filter(q => !ValidationRegex.queryName.test(q.name) || !q.value);
    setStatusMessage(undefined);

    if (invalidQueries.length > 0) {
      setStatusMessage(errorMessage);
      return;
    }

    let invalidHeaders = values.headers.filter(h => !ValidationRegex.headerName.test(h.name) || !h.value);
    if (invalidHeaders.length > 0) {
      setStatusMessage(errorMessage);
      return;
    }

    // Header should not contain x-functions-key
    invalidHeaders = values.headers.filter(h => h.name === 'x-functions-key');
    if (invalidHeaders.length > 0) {
      setStatusMessage({
        message: t('xFunctionsKey_validationMessage'),
        level: MessageBarType.error,
      });
    }
  };

  const onRequestBodyChange = newValue => {
    setReqBody(newValue);
  };

  const setUpdatedInputFormValues = () => {
    const updatedFormValues = { ...defaultInputFormValues };

    updatedFormValues.headers = [];
    updatedFormValues.queries = [];
    updatedFormValues.xFunctionKey = xFunctionKey;
    let localTestData;
    if (isHttpOrWebHookFunction) {
      try {
        localTestData = JSON.parse(testData || functionInfo.properties.test_data || '');
      } catch (err) {
        localTestData = { body: functionInfo.properties.test_data, method: HttpMethods.post };
        LogService.error(LogCategories.FunctionEdit, 'invalid-json', err);
      }
    } else {
      localTestData = testData || functionInfo.properties.test_data || '';
    }
    if (localTestData) {
      if (isHttpOrWebHookFunction) {
        // Make sure to remove the keys: {body, headers, method, queryStringParams};
        // if there are still some keys (meaning the test-data file has been manually updated by the user),
        // we consider the entire remaining object as the body
        if (localTestData.method) {
          updatedFormValues.method = localTestData.method;
          delete localTestData.method;
        } else {
          updatedFormValues.method = HttpMethods.post;
        }
        if (localTestData.queryStringParams) {
          const queryParameters = localTestData.queryStringParams;
          for (const parameters of queryParameters) {
            updatedFormValues.queries.push({ name: parameters.name, value: parameters.value });
          }
          delete localTestData.queryStringParams;
        }
        if (localTestData.headers) {
          const headers = localTestData.headers;
          for (const header of headers) {
            updatedFormValues.headers.push({ name: header.name, value: header.value });
          }
          delete localTestData.headers;
        }
        setReqBody(localTestData.body ?? localTestData);
      } else {
        setReqBody(localTestData);
      }
    }

    /**
     * Get URL Path Params
     */
    const functionInvokeUrl = getFunctionUrl();
    const matches = functionInvokeUrl.match(urlParameterRegExp);

    if (matches) {
      matches.forEach(m => {
        const splitResult = m
          .replace('{', '')
          .replace('}', '')
          .split(':');
        const name = splitResult[0];
        if (!updatedFormValues.queries.find(q => q.name.toLowerCase() === name.toLowerCase())) {
          updatedFormValues.queries.push({
            name,
            value: splitResult.length > 0 ? splitResult[1] : '',
          });
        }
      });
    }

    setDefaultInputFormValues(updatedFormValues);
  };

  const isCorsRuleAdded = () => {
    const siteConfig = functionEditorContext.functionData.siteConfig;
    if (siteConfig?.properties.cors?.allowedOrigins) {
      const referrer = CommonConstants.getReferrer();
      if (referrer) {
        return siteConfig.properties.cors.allowedOrigins.filter(allowedOrigin => allowedOrigin.toLocaleLowerCase() === referrer).length > 0;
      }
    }
    return false;
  };

  const getCorsRuleToRunFromBrowser = () => {
    return CommonConstants.getReferrer() ?? Url.getPortalUriByEnv;
  };

  const onMissingCorsMessageClick = () => {
    addCorsRule(getCorsRuleToRunFromBrowser());
  };

  const checkCorsAndDisableTest = () => !isCorsRuleAdded() && !!enablePortalCall;

  const getBanner = () => {
    if (checkCorsAndDisableTest()) {
      return (
        <CustomBanner
          message={t('missingCorsMessage').format(getCorsRuleToRunFromBrowser())}
          type={MessageBarType.warning}
          undocked={true}
          learnMoreLink={Links.corsLearnMore}
          onClick={() => {
            onMissingCorsMessageClick();
          }}
        />
      );
    }

    if (addingCorsRules) {
      return <CustomBanner message={t('functionEditorCorsWarning')} type={MessageBarType.info} />;
    } else if (!!responseContent && responseContent.code === 403) {
      return (
        <CustomBanner
          message={t('functionEditor_privateLinkRunMessage')}
          type={MessageBarType.warning}
          undocked={true}
          learnMoreLink={Links.functionsPrivateLinkLearnMore}
        />
      );
    }
  };

  useEffect(() => {
    !!responseContent && setSelectedPivotTab(PivotType.output);
    console.log(responseContent);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseContent]);

  useEffect(() => {
    setUpdatedInputFormValues();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testData, xFunctionKey]);

  return (
    <Formik
      initialValues={defaultInputFormValues}
      onSubmit={run}
      enableReinitialize={true}
      validate={validateForm}
      render={(formProps: FormikProps<InputFormValues>) => {
        const actionBarPrimaryButtonProps = {
          id: 'run',
          title: t('run'),
          onClick: formProps.submitForm,
          disable: !!statusMessage || checkCorsAndDisableTest() || !!addingCorsRules,
          autoFocus: true,
        };

        const actionBarSecondaryButtonProps = {
          id: 'close',
          title: t('close'),
          onClick: close,
          disable: false,
        };

        return (
          <Form className={addEditFormStyle}>
            {getBanner()}
            <div className={functionTestBodyStyle}>
              <Pivot
                selectedKey={selectedPivotTab}
                onLinkClick={(item?: PivotItem) => !!item && !!item.props.itemKey && setSelectedPivotTab(item.props.itemKey as PivotType)}
                overflowBehavior={OverflowBehavior.menu}>
                <PivotItem itemKey={PivotType.input} linkText={t('functionTestInput')}>
                  <FunctionTestInput
                    {...formProps}
                    functionInfo={functionInfo}
                    body={reqBody}
                    onRequestBodyChange={onRequestBodyChange}
                    urlObjs={urlObjs}
                  />
                </PivotItem>
                <PivotItem itemKey={PivotType.output} linkText={t('functionTestOutput')}>
                  <FunctionTestOutput responseContent={responseContent} />
                </PivotItem>
              </Pivot>
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
