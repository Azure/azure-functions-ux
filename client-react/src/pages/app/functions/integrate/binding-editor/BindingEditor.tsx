import { Field, Formik, FormikProps } from 'formik';
import { Dropdown } from 'office-ui-fabric-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import { ArmObj } from '../../../../../models/arm-obj';
import { BindingConfigDirection, BindingConfigMetadata, BindingsConfig } from '../../../../../models/functions/bindings-config';
import { BindingDirection, BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import EditBindingCommandBar from './EditBindingCommandBar';

export interface BindingEditorProps {
  allBindingsConfig: BindingsConfig;
  currentBindingInfo: BindingInfo;
  functionInfo: ArmObj<FunctionInfo>;
  resourceId: string;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
  onDelete: (currentBindingInfo: BindingInfo) => void;
}

export interface BindingEditorFormValues {
  [key: string]: any;
}

export enum ClosedReason {
  Save = 'save',
  Cancel = 'cancel',
  Delete = 'delete',
}

const fieldWrapperStyle = style({
  paddingTop: '20px',
});

const BindingEditor: React.SFC<BindingEditorProps> = props => {
  const { allBindingsConfig: bindingsConfig, currentBindingInfo, resourceId, onSubmit, onDelete } = props;
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(false);

  const bindingsConfigMetadata = bindingsConfig.bindings;
  const currentBindingMetadata = bindingsConfigMetadata.find(
    b => b.type === currentBindingInfo.type && b.direction === getBindingConfigDirection(currentBindingInfo)
  ) as BindingConfigMetadata;

  if (!currentBindingMetadata) {
    LogService.error(LogCategories.bindingEditor, 'no-binding-metadata-found', null);
    return <div />;
  }

  const builder = new BindingFormBuilder([currentBindingInfo], [currentBindingMetadata], resourceId, t, bindingsConfig.variables);
  const initialFormValues: BindingEditorFormValues = builder.getInitialFormValues();

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

    setIsDisabled(true);
    onSubmit(newBindingInfo, currentBindingInfo);
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={values => submit(values as BindingInfo)}>
      {(formProps: FormikProps<BindingEditorFormValues>) => {
        return (
          <form>
            <EditBindingCommandBar
              submitForm={formProps.submitForm}
              resetForm={() => formProps.resetForm(initialFormValues)}
              delete={() => onDelete(currentBindingInfo)}
              dirty={formProps.dirty}
              loading={isDisabled}
            />
            <div className={fieldWrapperStyle}>
              <FormControlWrapper label={t('integrateBindingType')} layout={Layout.vertical}>
                <Field
                  name="type"
                  component={Dropdown}
                  options={[{ key: currentBindingMetadata.type, text: t(currentBindingMetadata.displayName.substring(1)) }]}
                  disabled={true}
                  selectedKey={currentBindingMetadata.type}
                  {...formProps}
                />
              </FormControlWrapper>

              {builder.getFields(formProps, isDisabled)}
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export const getBindingConfigDirection = (bindingInfo: BindingInfo): BindingConfigDirection => {
  if (bindingInfo.direction === BindingDirection.in) {
    return bindingInfo.type.toLowerCase().indexOf('trigger') > -1 ? BindingConfigDirection.trigger : BindingConfigDirection.in;
  }

  return BindingConfigDirection.out;
};

export const getBindingDirection = (bindingConfigDirection: BindingConfigDirection): BindingDirection => {
  return bindingConfigDirection === BindingConfigDirection.out ? BindingDirection.out : BindingDirection.in;
};

export default BindingEditor;
