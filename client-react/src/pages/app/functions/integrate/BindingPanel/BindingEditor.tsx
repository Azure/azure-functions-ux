import { Field, Formik, FormikProps } from 'formik';
import i18next from 'i18next';
import { Dropdown, Link, TextField } from 'office-ui-fabric-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingDirection as FunctionBindingDirection, BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionsRuntimeVersionHelper } from '../../../../../utils/FunctionsRuntimeVersionHelper';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import EditBindingCommandBar from './EditBindingCommandBar';
import { EventGrid } from '../FunctionIntegrateConstants';

export interface BindingEditorProps {
  allBindings: Binding[];
  currentBindingInfo: BindingInfo;
  functionAppId: string;
  functionAppRuntimeVersion: string;
  functionAppSystemKey: string;
  functionInfo: ArmObj<FunctionInfo>;
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
  const {
    allBindings,
    currentBindingInfo,
    functionAppId,
    functionAppRuntimeVersion,
    functionAppSystemKey,
    functionInfo,
    onSubmit,
    onDelete,
  } = props;
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const [isDisabled, setIsDisabled] = useState(false);

  const currentBinding = allBindings.find(
    b => b.type === currentBindingInfo.type && b.direction === getBindingDirection(currentBindingInfo)
  ) as Binding;

  if (!currentBinding) {
    LogService.error(LogCategories.bindingEditor, 'no-binding-metadata-found', null);
    return <div />;
  }

  const builder = new BindingFormBuilder([currentBindingInfo], [currentBinding], functionAppId, t);
  const initialFormValues: BindingEditorFormValues = builder.getInitialFormValues();

  const submit = (newBindingInfo: BindingInfo) => {
    const checkboxSettings = (currentBinding.settings && currentBinding.settings.filter(s => s.value === 'checkBoxList')) || [];
    for (const settingMetadata of checkboxSettings) {
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
          <>
            <form>
              <EditBindingCommandBar
                submitForm={formProps.submitForm}
                resetForm={() => formProps.resetForm(initialFormValues)}
                delete={() => onDelete(currentBindingInfo)}
                dirty={formProps.dirty}
                valid={formProps.isValid}
                loading={isDisabled}
              />
              <div className={fieldWrapperStyle}>
                <FormControlWrapper label={t('integrateBindingType')} layout={Layout.vertical}>
                  <Field
                    name="type"
                    component={Dropdown}
                    options={[{ key: currentBinding.type, text: currentBinding.displayName }]}
                    disabled={true}
                    selectedKey={currentBinding.type}
                    {...formProps}
                  />
                </FormControlWrapper>

                {builder.getFields(formProps, isDisabled)}
              </div>
            </form>
            {currentBinding.type === EventGrid.eventGridType
              ? eventGridField(functionAppRuntimeVersion, functionAppSystemKey, functionInfo, t, portalContext)
              : undefined}
          </>
        );
      }}
    </Formik>
  );
};

// Bindings uses 'trigger' as a direction, but functions.json does not
// These two functions convert between the two kinds
export const getBindingDirection = (bindingInfo: BindingInfo): BindingDirection => {
  if (bindingInfo.direction === BindingDirection.in) {
    return bindingInfo.type.toLowerCase().indexOf('trigger') > -1 ? BindingDirection.trigger : BindingDirection.in;
  }

  return BindingDirection.out;
};

export const getFunctionBindingDirection = (bindingDirection: BindingDirection): FunctionBindingDirection => {
  return bindingDirection === BindingDirection.out ? FunctionBindingDirection.out : FunctionBindingDirection.in;
};

const eventGridField = (
  functionAppRuntimeVersion: string,
  functionAppSystemKey: string,
  functionInfo: ArmObj<FunctionInfo>,
  t: i18next.TFunction,
  portalContext: PortalCommunicator
): JSX.Element => {
  const mainSiteUrl = !!functionInfo.properties.href ? functionInfo.properties.href.split('/admin')[0] : '';
  const path =
    FunctionsRuntimeVersionHelper.parseConfiguredRuntimeVersion(functionAppRuntimeVersion) === RuntimeExtensionMajorVersions.v1
      ? EventGrid.EventGridPath.v1
      : EventGrid.EventGridPath.v2;
  const functionName = functionInfo.name.split('/')[1];
  const finalUrl = `${mainSiteUrl.toLowerCase()}/${path}?functionName=${functionName}&code=${functionAppSystemKey}`;

  return (
    <div className={fieldWrapperStyle}>
      <FormControlWrapper
        label={t('eventGrid_label')}
        layout={Layout.vertical}
        tooltip={t('eventGrid_help')}
        key={'event-grid-subscription-url'}>
        <Field
          name={'event-grid-subscription-url'}
          id={'event-grid-subscription-url'}
          component={TextField}
          disabled={true}
          value={finalUrl}
        />
      </FormControlWrapper>

      <Link onClick={() => onEventGridCreateClick(finalUrl, functionName, portalContext)}>{t('eventGrid_createConnection')}</Link>
    </div>
  );
};

const onEventGridCreateClick = (url: string, functionName: string, portalContext: PortalCommunicator) => {
  portalContext.openBlade(
    {
      detailBlade: 'CreateEventSubscriptionBlade',
      detailBladeInputs: { inputs: { subscriberEndpointUrl: url, labels: ['functions', functionName] } },
      extension: 'Microsoft_Azure_EventGrid',
    },
    'event-grid-binding'
  );
};

export default BindingEditor;
