import React from 'react';
import { BindingConfigMetadata, BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import { BindingInfo, BindingDirection } from '../../../../../models/functions/function-binding';
import { useTranslation } from 'react-i18next';
import { FormikProps, Formik } from 'formik';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import EditBindingCommandBar from './EditBindingCommandBar';
import { style } from 'typestyle';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';

export interface BindingEditorProps {
  allBindingsConfigMetadata: BindingConfigMetadata[];
  currentBindingInfo: BindingInfo;
  functionInfo: ArmObj<FunctionInfo>;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
}

export interface BindingEditorFormValues {
  [key: string]: any;
}

const fieldWrapperStyle = style({
  padding: '20px',
});

const BindingEditor: React.SFC<BindingEditorProps> = props => {
  const { allBindingsConfigMetadata: bindingsConfigMetadata, currentBindingInfo, onSubmit } = props;

  const { t } = useTranslation();

  const currentBindingMetadata = bindingsConfigMetadata.find(b => b.type === currentBindingInfo.type) as BindingConfigMetadata;

  if (!currentBindingMetadata) {
    LogService.error(LogCategories.bindingEditor, 'no-binding-metadata-found', null);
    return <div />;
  }

  const builder = new BindingFormBuilder(currentBindingInfo, currentBindingMetadata, t);
  const initialFormValues = builder.getInitialFormValues();

  const submit = (newBindingInfo: BindingInfo) => {
    const checkboxSettingsMetadata = currentBindingMetadata.settings.filter(s => s.value === 'checkBoxList');
    for (const settingMetadata of checkboxSettingsMetadata) {
      const newSetting = newBindingInfo[settingMetadata.name];

      // ellhamai - Need to double check this assumption.  For httpTriggers, we need to clear out the 'methods'
      // property if all items are checked.  Not sure if this logic applies for everything.
      if (Array.isArray(newSetting) && settingMetadata.enum && newSetting.length === settingMetadata.enum.length) {
        delete newBindingInfo[settingMetadata.name];
      }
    }

    onSubmit(newBindingInfo, currentBindingInfo);
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={values => submit(values as BindingInfo)}>
      {(formProps: FormikProps<BindingEditorFormValues>) => {
        return (
          <form>
            <EditBindingCommandBar
              submitForm={formProps.submitForm}
              resetForm={formProps.resetForm}
              delete={() => onDelete(currentBindingInfo)}
              dirty={formProps.dirty}
            />
            <div className={fieldWrapperStyle}>{builder.getFields(formProps)}</div>
          </form>
        );
      }}
    </Formik>
  );
};

const onDelete = (bindingInfo: BindingInfo) => {
  console.log('delete!');
};

export const getBindingConfigDirection = (bindingInfo: BindingInfo) => {
  if (bindingInfo.direction === BindingDirection.in) {
    return bindingInfo.type.toLowerCase().indexOf('trigger') > -1 ? BindingConfigDirection.trigger : BindingConfigDirection.in;
  }

  return BindingConfigDirection.out;
};

export default BindingEditor;
