import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  pivotItemWrapper,
  httpAddDataStyle,
  httpAddDataTextStyle,
  functionTestInputGroupStyle,
  bodyEditorStyle,
  keyValuePairTextStyle,
  keyValuePairButtonStyle,
  keyValuePairStyle,
} from './FunctionTest.styles';
import { Label, IDropdownOption, TextField } from 'office-ui-fabric-react';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import MonacoEditor from '../../../../../components/monaco-editor/monaco-editor';
import { ThemeContext } from '../../../../../ThemeContext';
import { InputFormValues, EmptyKeyValuePair, KeyValuePair, HttpMethods } from '../FunctionEditor.types';
import { FormikProps, Field, FieldArray } from 'formik';
import IconButton from '../../../../../components/IconButton/IconButton';

export interface FunctionTestInputProps {}

interface KeyValueComponent {
  items: KeyValuePair[];
  itemName: string;
  addItemText: string;
}

const KeyValueFieldArrayComponent: React.FC<KeyValueComponent> = props => {
  const { items, itemName, addItemText } = props;
  const theme = useContext(ThemeContext);
  return (
    <FieldArray
      name={itemName}
      render={arrayHelpers => (
        <div className={httpAddDataStyle}>
          {items.map((item, index) => (
            <div className={keyValuePairStyle} key={index}>
              <Field
                className={keyValuePairTextStyle}
                component={TextField}
                id={`${index}-${itemName}-key`}
                name={`${itemName}[${index}].key`}
              />
              <Field
                className={keyValuePairTextStyle}
                component={TextField}
                id={`${index}-${itemName}-value`}
                name={`${itemName}[${index}].value`}
              />
              <IconButton
                className={keyValuePairButtonStyle}
                id={`${index}-cancel-${itemName}-button`}
                iconProps={{ iconName: 'ChromeClose' }}
                onClick={() => arrayHelpers.remove(index)}
              />
            </div>
          ))}
          <span onClick={() => arrayHelpers.push(EmptyKeyValuePair)} className={httpAddDataTextStyle(theme)}>{`+ ${addItemText}`}</span>
        </div>
      )}
    />
  );
};

// TODO (krmitta): Complete Content for Input-Tab [WI: 5536379]
const FunctionTestInput: React.SFC<FormikProps<InputFormValues> & FunctionTestInputProps> = props => {
  const { t } = useTranslation();

  const { values } = props;

  // TODO (krmitta): Update Dropdown options according to the function [WI: 5536379]
  const dropdownOptions: IDropdownOption[] = [
    {
      key: HttpMethods.Get,
      text: HttpMethods.Get,
    },
    {
      key: HttpMethods.Post,
      text: HttpMethods.Post,
    },
  ];

  return (
    <div className={pivotItemWrapper}>
      {t('functionTestInputDescription')}
      <div className={functionTestInputGroupStyle}>
        <Label>{t('httpRun_httpMethod')}</Label>
        <Field id="httpMethod" name="httpMethod" component={DropdownNoFormik} options={dropdownOptions} />
      </div>
      <div className={functionTestInputGroupStyle}>
        <Label>{t('httpRun_query')}</Label>
        <KeyValueFieldArrayComponent itemName="queries" items={values.queries} addItemText={t('httpRun_addParameter')} />
      </div>
      <div className={functionTestInputGroupStyle}>
        <Label>{t('httpRun_headers')}</Label>
        <KeyValueFieldArrayComponent itemName="headers" items={values.headers} addItemText={t('httpRun_addHeader')} />
      </div>
      <div className={functionTestInputGroupStyle}>
        <Label>{t('rrOverride_boby')}</Label>
        <div className={bodyEditorStyle}>
          <MonacoEditor
            language="json"
            defaultValue={''}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              cursorBlinking: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FunctionTestInput;
