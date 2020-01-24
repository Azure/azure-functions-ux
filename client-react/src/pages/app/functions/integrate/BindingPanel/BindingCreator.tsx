import { Field, Formik, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../../components/ActionBar';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../../models/functions/function-binding';
import { BindingEditorFormValues, BindingFormBuilder } from '../../common/BindingFormBuilder';
import { getFunctionBindingDirection } from './BindingEditor';
import i18next from 'i18next';

export interface BindingCreatorProps {
  bindings: Binding[];
  functionAppId: string;
  bindingDirection: BindingDirection;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo) => void;
  setRequiredBindingId: (id: string) => void;
}

const BindingCreator: React.SFC<BindingCreatorProps> = props => {
  const { onSubmit, onPanelClose, functionAppId, bindings, bindingDirection, setRequiredBindingId } = props;
  const { t } = useTranslation();
  const filteredBindings = bindings.filter(binding => {
    return binding.direction === bindingDirection;
  });
  getRequiredBindingData(filteredBindings, setRequiredBindingId);

  if (!bindings) {
    return <LoadingComponent />;
  }

  const dropdownOptions: IDropdownOption[] = filteredBindings.map(binding => {
    return { key: binding.type, text: binding.displayName };
  });

  const initialFormValues: BindingInfo = {
    name: '',
    direction: getFunctionBindingDirection(bindingDirection),
    type: bindingDirection === BindingDirection.trigger ? BindingType.httpTrigger : BindingType.blob,
  };

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={(values: BindingEditorFormValues) => {
        onSubmit({ ...(values as BindingInfo) });
      }}>
      {(formProps: FormikProps<BindingEditorFormValues>) => {
        return (
          <form>
            <p>{t('integrateCreateBindingInstructions').format(formProps.values.direction)}</p>
            <FormControlWrapper label={t('integrateBindingType')} layout={Layout.vertical}>
              <Field component={Dropdown} name="type" options={dropdownOptions} {...formProps} />
            </FormControlWrapper>

            {formProps.values.type ? (
              <div>
                <h3>
                  {t('integrateCreateBindingTypeDetails').format(
                    (filteredBindings.find(binding => formProps.values.type === binding.type) as Binding).displayName
                  )}
                </h3>
                {bindingTypeSpecificFields(formProps, filteredBindings, functionAppId, t)}
              </div>
            ) : null}

            <ActionBar
              id="connection-string-edit-footer"
              primaryButton={actionBarPrimaryButtonProps(formProps, t)}
              secondaryButton={actionBarSecondaryButtonProps(onPanelClose, t)}
            />
          </form>
        );
      }}
    </Formik>
  );
};

const getRequiredBindingData = (bindings: Binding[], setRequiredBindingId: (id: string) => void) => {
  bindings.forEach(binding => {
    if (binding && !binding.settings) {
      setRequiredBindingId(binding.id);
    }
  });
};

const bindingTypeSpecificFields = (
  formProps: FormikProps<BindingEditorFormValues>,
  filteredBindings: Binding[],
  functionAppId: string,
  t: i18next.TFunction
): JSX.Element[] => {
  const typeSpecificMetadata = filteredBindings.find(metadata => {
    return metadata.type === formProps.values.type;
  });

  if (!typeSpecificMetadata) {
    return [];
  }

  const builder = new BindingFormBuilder([formProps.values as BindingInfo], [typeSpecificMetadata], functionAppId, t);

  return builder.getFields(formProps, false);
};

const actionBarPrimaryButtonProps = (formProps: FormikProps<BindingEditorFormValues>, t: i18next.TFunction) => {
  return {
    id: 'save',
    title: t('ok'),
    onClick: () => formProps.submitForm(),
    disable: !formProps.isValid,
  };
};

const actionBarSecondaryButtonProps = (onPanelClose: () => void, t: i18next.TFunction) => {
  return {
    id: 'cancel',
    title: t('cancel'),
    onClick: () => onPanelClose(),
    disable: false,
  };
};

export default BindingCreator;
