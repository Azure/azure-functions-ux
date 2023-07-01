import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, FieldArray, FieldProps, FormikProps } from 'formik';
import get from 'lodash-es/get';
import { Subject } from 'rxjs';

import { IDropdownOption, ITextFieldProps, Label, TextField } from '@fluentui/react';

import Dropdown from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import IconButton from '../../../../../../components/IconButton/IconButton';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../../../components/monaco-editor/monaco-editor';
import { ArmObj } from '../../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import { PortalTheme } from '../../../../../../models/portal-models';
import { StartupInfoContext } from '../../../../../../StartupInfoContext';
import { ThemeContext } from '../../../../../../ThemeContext';
import { BindingManager } from '../../../../../../utils/BindingManager';
import StringUtils from '../../../../../../utils/string';
import { EmptyNameValuePair, HttpMethods, InputFormValues, NameValuePair, UrlObj } from '../FunctionEditor.types';
import { FunctionEditorContext } from '../FunctionEditorDataLoader';
import { isNewNodeProgrammingModel } from '../useFunctionEditorQueries';

import {
  bodyEditorStyle,
  functionTestGroupStyle,
  httpAddDataStyle,
  httpAddDataTextStyle,
  keyValuePairButtonStyle,
  keyValuePairLabelDivStyle,
  keyValuePairLabelStyle,
  keyValuePairStyle,
  keyValuePairTextStyle,
  pivotItemWrapper,
  testFormLabelStyle,
} from './FunctionTest.styles';

export interface FunctionTestInputProps {
  functionInfo: ArmObj<FunctionInfo>;
  body: string;
  urlObjs: UrlObj[];
  onRequestBodyChange: (newValue, event) => void;
}

interface KeyValueComponent {
  items: NameValuePair[];
  itemName: string;
  addItemText: string;
}

const KeyValueFieldComponent: React.FC<FieldProps & ITextFieldProps> = props => {
  const { field, form, ...rest } = props;
  const errorMessage = get(form.errors, field.name, '') as string;
  const inputDebouncer = new Subject<{ e: any; value: string }>();
  inputDebouncer.pipe().subscribe(({ e, value }) => {
    form.setFieldValue(field.name, value);
    field.onChange(e);
  });

  const onChange = (e: any, value: string) => {
    inputDebouncer.next({ e, value });
  };

  return <TextField value={field.value} onBlur={field.onBlur} errorMessage={errorMessage} onChange={onChange} {...rest} />;
};

const KeyValueFieldArrayComponent: React.FC<KeyValueComponent> = props => {
  const { items, itemName, addItemText } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <FieldArray
      name={itemName}
      render={arrayHelpers => (
        <div className={httpAddDataStyle}>
          {items.length > 0 && (
            <div className={keyValuePairLabelDivStyle}>
              <Label className={keyValuePairLabelStyle}>{`${t('nameRes')}`}</Label>
              <Label className={keyValuePairLabelStyle}>{`${t('value')}`}</Label>
            </div>
          )}
          {items.map((item, index) => (
            <div className={keyValuePairStyle} key={index}>
              <Field
                className={keyValuePairTextStyle}
                component={KeyValueFieldComponent}
                placeholder={t('enterName')}
                id={`${index}-${itemName}-name`}
                name={`${itemName}[${index}].name`}
              />
              <Field
                className={keyValuePairTextStyle}
                component={KeyValueFieldComponent}
                placeholder={t('enterValue')}
                id={`${index}-${itemName}-value`}
                name={`${itemName}[${index}].value`}
              />
              <IconButton
                className={keyValuePairButtonStyle(theme)}
                id={`${index}-cancel-${itemName}-button`}
                iconProps={{ iconName: 'Delete' }}
                onClick={() => arrayHelpers.remove(index)}
              />
            </div>
          ))}
          <span onClick={() => arrayHelpers.push(EmptyNameValuePair)} className={httpAddDataTextStyle(theme)}>{`+ ${addItemText}`}</span>
        </div>
      )}
    />
  );
};

// TODO (krmitta): Complete Content for Input-Tab [WI: 5536379]
const FunctionTestInput: React.SFC<FormikProps<InputFormValues> & FunctionTestInputProps> = props => {
  const { t } = useTranslation();

  const startUpInfoContext = useContext(StartupInfoContext);
  const functionEditorContext = useContext(FunctionEditorContext);

  const { values, functionInfo, body, onRequestBodyChange, urlObjs } = props;

  const isHttpOrWebHookFunction = functionEditorContext.isHttpOrWebHookFunction(functionInfo);

  // Passing body for GET/Head method will fail if it is new Node programming model.
  // Therefore, we hide Monaco editor so that user cannot input body.
  const shouldHideBody = React.useMemo((): boolean => {
    return (
      isNewNodeProgrammingModel(functionInfo) &&
      !!isHttpOrWebHookFunction &&
      (StringUtils.equalsIgnoreCase(values.method, HttpMethods.get) || StringUtils.equalsIgnoreCase(values.method, HttpMethods.head))
    );
  }, [functionInfo, values, isHttpOrWebHookFunction]);

  const getDropdownOptions = (): IDropdownOption[] => {
    const httpTrigger = BindingManager.getHttpTriggerTypeInfo(functionInfo.properties);
    const dropdownOptions: IDropdownOption[] = [];
    if (httpTrigger && httpTrigger.methods) {
      httpTrigger.methods.forEach((m: string) => {
        dropdownOptions.push({ key: m.toLowerCase(), text: m.toUpperCase() });
      });
    } else {
      for (const method in HttpMethods) {
        if (method) {
          dropdownOptions.push({ key: method, text: method.toUpperCase() });
        }
      }
    }
    return dropdownOptions;
  };

  const getFunctionKeyDropdown = (): IDropdownOption[] => {
    return urlObjs.map(urlObject => {
      return {
        key: urlObject.key,
        text: `${urlObject.text} (${urlObject.type} key)`,
        data: urlObject.data,
      };
    });
  };

  return (
    <div className={pivotItemWrapper}>
      {isHttpOrWebHookFunction ? t('functionTestInputDescriptionForHttp') : t('functionTestInputDescription')}
      {isHttpOrWebHookFunction && (
        <div className={functionTestGroupStyle}>
          <Field
            id="method"
            name="method"
            label={t('httpRun_httpMethod')}
            layout={Layout.Vertical}
            mouseOverToolTip={t('httpMethod_tooltip')}
            customLabelClassName={testFormLabelStyle}
            component={Dropdown}
            options={getDropdownOptions()}
          />
        </div>
      )}
      <div className={functionTestGroupStyle}>
        <Field
          id="xFunctionKey"
          name="xFunctionKey"
          label={t('keysDialog_key')}
          layout={Layout.Vertical}
          customLabelClassName={testFormLabelStyle}
          component={Dropdown}
          options={getFunctionKeyDropdown()}
        />
      </div>
      {isHttpOrWebHookFunction && (
        <div className={functionTestGroupStyle}>
          <Label className={testFormLabelStyle}>{t('httpRun_query')}</Label>
          <KeyValueFieldArrayComponent itemName="queries" items={values.queries} addItemText={t('httpRun_addParameter')} />
        </div>
      )}
      {isHttpOrWebHookFunction && (
        <div className={functionTestGroupStyle}>
          <Label className={testFormLabelStyle}>{t('httpRun_headers')}</Label>
          <KeyValueFieldArrayComponent itemName="headers" items={values.headers} addItemText={t('httpRun_addHeader')} />
        </div>
      )}
      {!shouldHideBody && (
        <div className={functionTestGroupStyle}>
          <Label className={testFormLabelStyle}>{t('rrOverride_boby')}</Label>
          <div className={bodyEditorStyle}>
            <MonacoEditor
              language="json"
              value={StringUtils.stringifyJsonForEditor(body)}
              onChange={onRequestBodyChange}
              height="300px"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                cursorBlinking: true,
              }}
              theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionTestInput;
