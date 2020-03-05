import { Field, Formik, FormikProps } from 'formik';
import { Link } from 'office-ui-fabric-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingDirection as FunctionBindingDirection, BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import { FunctionIntegrateConstants } from '../FunctionIntegrateConstants';
import EditBindingCommandBar from './EditBindingCommandBar';
import ConfirmDialog from '../../../../../components/ConfirmDialog/ConfirmDialog';
import { dialogModelStyle } from '../FunctionIntegrate.style';
import { DeleteDialog } from './BindingPanel';

export interface BindingEditorProps {
  allBindings: Binding[];
  currentBindingInfo: BindingInfo;
  functionAppId: string;
  functionInfo: ArmObj<FunctionInfo>;
  readOnly: boolean;
  deleteDialogDetails: DeleteDialog;
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
  const { allBindings, currentBindingInfo, functionAppId, functionInfo, readOnly, onSubmit, deleteDialogDetails } = props;
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

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

  const closeDeleteConfirmDialog = () => {
    setShowDeleteConfirmDialog(false);
  };

  const onDelete = () => {
    closeDeleteConfirmDialog();
    props.onDelete(currentBindingInfo);
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={values => submit(values as BindingInfo)}>
      {(formProps: FormikProps<BindingEditorFormValues>) => {
        return (
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: onDelete,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: closeDeleteConfirmDialog,
              }}
              title={deleteDialogDetails.header}
              content={deleteDialogDetails.content}
              hidden={!showDeleteConfirmDialog}
              onDismiss={closeDeleteConfirmDialog}
              modalStyles={dialogModelStyle}
              showCloseModal={false}
            />
            <form>
              <EditBindingCommandBar
                submitForm={formProps.submitForm}
                resetForm={() => formProps.resetForm(initialFormValues)}
                delete={() => setShowDeleteConfirmDialog(true)}
                dirty={formProps.dirty}
                valid={formProps.isValid}
                loading={isDisabled}
                disabled={readOnly}
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

                {builder.getFields(formProps, readOnly || isDisabled)}
              </div>
            </form>
            {currentBinding.type === FunctionIntegrateConstants.eventGridType ? (
              <Link onClick={() => onEventGridCreateClick(functionInfo, portalContext)}>{t('eventGrid_createConnection')}</Link>
            ) : (
              undefined
            )}
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

const onEventGridCreateClick = (functionInfo: ArmObj<FunctionInfo>, portalContext: PortalCommunicator) => {
  const functionName = functionInfo.name.split('/')[1];

  portalContext.openBlade(
    {
      detailBlade: 'CreateEventSubscriptionBlade',
      extension: 'Microsoft_Azure_EventGrid',
      detailBladeInputs: {
        inputs: {
          label: `functions-${functionName.toLowerCase()}`,
          endpointType: 'AzureFunction',
          endpointResourceId: functionInfo.id,
        },
      },
    },
    'function-dev'
  );
};

export default BindingEditor;
