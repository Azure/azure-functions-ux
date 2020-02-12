import { Field, Formik, FormikProps } from 'formik';
import i18next from 'i18next';
import { IDropdownOption } from 'office-ui-fabric-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../../components/ActionBar';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../../models/functions/function-binding';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import { getFunctionBindingDirection } from './BindingEditor';

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
  const [currentType, setCurrentType] = useState<BindingType>(
    bindingDirection === BindingDirection.trigger ? BindingType.httpTrigger : BindingType.blob
  );
  const { t } = useTranslation();

  const filteredBindings = bindings.filter(binding => {
    return binding.direction === bindingDirection;
  });

  getRequiredBindingData(filteredBindings, setRequiredBindingId);

  if (!bindings) {
    return <LoadingComponent />;
  }

  const initialFormValues: BindingInfo = {
    name: '',
    direction: getFunctionBindingDirection(bindingDirection),
    type: currentType,
    ...getDefaultValues(currentType, filteredBindings),
  };

  const dropdownOptions: IDropdownOption[] = filteredBindings.map(binding => {
    return { key: binding.type, text: binding.displayName };
  });

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialFormValues}
      onSubmit={(values: BindingInfo) => {
        onSubmit({ ...(values as BindingInfo) });
      }}>
      {(formProps: FormikProps<BindingInfo>) => {
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
                {bindingTypeSpecificFields(formProps, filteredBindings, functionAppId, t, currentType, setCurrentType)}
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
  formProps: FormikProps<BindingInfo>,
  filteredBindings: Binding[],
  functionAppId: string,
  t: i18next.TFunction,
  currentType: BindingType,
  setCurrentType
): JSX.Element[] => {
  const binding = filteredBindings.find(filteredBinding => {
    return filteredBinding.type === formProps.values.type;
  });

  if (!binding) {
    return [];
  }

  if (currentType !== formProps.values.type) {
    const cleanedValues: BindingInfo = {
      name: formProps.values.name,
      type: formProps.values.type,
      direction: formProps.values.direction,
      ...getDefaultValues(formProps.values.type, [binding]),
    };

    setCurrentType(cleanedValues.type);
    formProps.setValues(cleanedValues);
  }

  const builder = new BindingFormBuilder([formProps.values], [binding], functionAppId, t);

  return builder.getFields(formProps, false);
};

const getDefaultValues = (bindingType: BindingType, filteredBindings: Binding[]): { [key: string]: string } => {
  const defaultValues: { [key: string]: string } = {};

  const binding = filteredBindings.find(filteredBinding => {
    return filteredBinding.type === bindingType;
  });

  if (binding) {
    for (const setting of binding.settings || []) {
      defaultValues[setting.name] = setting.defaultValue;
    }

    return defaultValues;
  }

  return {};
};

const actionBarPrimaryButtonProps = (formProps: FormikProps<BindingInfo>, t: i18next.TFunction) => {
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
