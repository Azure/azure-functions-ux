import { Field, Formik, FormikProps } from 'formik';
import i18next from 'i18next';
import { IDropdownOption, Link, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../../components/ActionBar';
import { learnMoreLinkStyle } from '../../../../../components/form-controls/formControl.override.styles';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../../models/functions/function-binding';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import { FunctionIntegrateConstants } from '../FunctionIntegrateConstants';
import { getFunctionBindingDirection } from './BindingEditor';
import Dropdown from '../../../../../components/form-controls/DropDown';

export interface BindingCreatorProps {
  bindingDirection: BindingDirection;
  bindings: Binding[];
  functionAppId: string;
  onlyBuiltInBindings: boolean;
  readOnly: boolean;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo) => void;
}

const BindingCreator: React.SFC<BindingCreatorProps> = props => {
  const { bindingDirection, bindings, functionAppId, onlyBuiltInBindings, readOnly, onPanelClose, onSubmit } = props;
  const [currentType, setCurrentType] = useState<BindingType>(
    bindingDirection === BindingDirection.trigger ? BindingType.httpTrigger : BindingType.blob
  );
  const { t } = useTranslation();

  const directionalBindings = bindings.filter(binding => {
    return binding.direction === bindingDirection;
  });

  if (!bindings) {
    return <LoadingComponent />;
  }

  const initialFormValues: BindingInfo = {
    name: '',
    direction: getFunctionBindingDirection(bindingDirection),
    type: currentType,
    ...getDefaultValues(currentType, directionalBindings),
  };

  const filteredBindings = onlyBuiltInBindings
    ? directionalBindings.filter(binding => {
        return FunctionIntegrateConstants.builtInBindingTypes.includes(binding.type);
      })
    : directionalBindings;

  const dropdownOptions: IDropdownOption[] = filteredBindings
    .map(binding => {
      return { key: binding.type, text: binding.displayName };
    })
    .sort((optionA, optionB) => {
      return optionA.text > optionB.text ? 1 : optionA.text < optionB.text ? -1 : 0;
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
            <p>{getInstructions(formProps.values.direction, t)}</p>
            <FormControlWrapper label={t('integrateBindingType')} layout={Layout.vertical}>
              <Field
                component={Dropdown}
                name="type"
                disabled={onlyBuiltInBindings && dropdownOptions.length === 0}
                options={dropdownOptions}
                {...formProps}
              />
            </FormControlWrapper>

            {/* Extension bundles warning */}
            {onlyBuiltInBindings ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
                {t('functionCreate_extensionBundlesRequired')}
                <Link href={CommonConstants.Links.extensionBundlesRequiredLearnMore} target="_blank" className={learnMoreLinkStyle}>
                  {t('learnMore')}
                </Link>
              </MessageBar>
            ) : null}

            {/* Binding specific fields */}
            {dropdownOptions.length > 0 && formProps.values.type ? (
              <div>
                <h3>
                  {t('integrateCreateBindingTypeDetails').format(
                    (directionalBindings.find(binding => formProps.values.type === binding.type) as Binding).displayName
                  )}
                </h3>
                {bindingTypeSpecificFields(formProps, directionalBindings, functionAppId, t, currentType, setCurrentType)}
              </div>
            ) : null}

            <ActionBar
              id="connection-string-edit-footer"
              primaryButton={actionBarPrimaryButtonProps(formProps, readOnly, t)}
              secondaryButton={actionBarSecondaryButtonProps(onPanelClose, t)}
            />
          </form>
        );
      }}
    </Formik>
  );
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
  }

  return defaultValues;
};

const getInstructions = (bindingDirection: BindingDirection, t: i18next.TFunction) => {
  switch (bindingDirection) {
    case BindingDirection.in: {
      return t('integrateCreateInputBindingInstructions');
    }
    case BindingDirection.out: {
      return t('integrateCreateOutputBindingInstructions');
    }
    default: {
      return t('integrateCreateTriggerBindingInstructions');
    }
  }
};

const actionBarPrimaryButtonProps = (formProps: FormikProps<BindingInfo>, readOnly: boolean, t: i18next.TFunction) => {
  return {
    id: 'save',
    title: t('ok'),
    onClick: () => formProps.submitForm(),
    disable: readOnly || !formProps.isValid,
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
