import { FieldProps, Formik, FormikProps } from 'formik';
import { IDropdownOption, IDropdownProps, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../../ApiHelpers/ArmHelper';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { AuthorizationRule, KeyList, Namespace } from '../../../../../../models/servicebus';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { generateAppSettingName } from '../../ResourceDropdown';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { ServiceBusPivotContext } from './ServiceBusPivotDataLoader';

export interface ServiceBusPivotFormValues {
  namespace: ArmObj<Namespace> | undefined;
  policy: ArmObj<AuthorizationRule> | undefined;
}

const EventHubPivot: React.SFC<NewConnectionCalloutProps & IDropdownProps & FieldProps & CustomDropdownProps> = props => {
  const provider = useContext(ServiceBusPivotContext);
  const { t } = useTranslation();
  const { resourceId, appSettingKeys } = props;
  const [formValues, setFormValues] = useState<ServiceBusPivotFormValues>({ namespace: undefined, policy: undefined });
  const [namespaces, setNamespaces] = useState<ArmObj<Namespace>[] | undefined>(undefined);
  const [namespaceAuthRules, setNamespaceAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!namespaces) {
      provider.fetchNamespaces(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(
            LogCategories.bindingResource,
            'getNamespaces',
            `Failed to get Namespaces: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setNamespaces(r.data.value);
      });
    } else if (formValues.namespace) {
      if (!namespaceAuthRules) {
        provider.fetchAuthRules(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getAuthRules',
              `Failed to get Authorization Rules: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
            return;
          }
          setNamespaceAuthRules(r.data.value);
        });
      }
      if (formValues.policy && !keyList) {
        provider.fetchKeyList(formValues.policy.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getKeyList',
              `Failed to get Key List: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
            return;
          }
          setKeyList(r.data);
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  if (!namespaces) {
    return <LoadingComponent />;
  }

  const namespaceOptions: IDropdownOption[] = [];
  namespaces.forEach(namespace => namespaceOptions.push({ text: namespace.name, key: namespace.id, data: namespace }));
  if (!formValues.namespace && namespaceOptions.length > 0) {
    setFormValues({ ...formValues, namespace: namespaces[0] });
  }

  const policyOptions: IDropdownOption[] = [];
  if (namespaceAuthRules) {
    namespaceAuthRules.forEach(rule => policyOptions.push({ text: rule.name, key: rule.id, data: rule }));
    if (!formValues.policy && policyOptions.length > 0) {
      setFormValues({ ...formValues, policy: namespaceAuthRules[0] });
    }
  }

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() =>
        setServiceBusConnection(
          formValues,
          keyList,
          appSettingKeys,
          props.setNewAppSetting,
          props.setSelectedItem,
          props.setIsDialogVisible
        )
      }>
      {(formProps: FormikProps<ServiceBusPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            {!!namespaces && namespaces.length === 0 ? (
              <p>{t('serviceBusPicker_noNamespaces')}</p>
            ) : (
              <>
                <Dropdown
                  label={t('serviceBusPicker_namespace')}
                  options={namespaceOptions}
                  selectedKey={formValues.namespace && formValues.namespace.id}
                  onChange={(o, e) => {
                    setFormValues({ namespace: e && e.data, policy: undefined });
                    setNamespaceAuthRules(undefined);
                    setKeyList(undefined);
                  }}
                  errorMessage={undefined}
                  layout={Layout.Vertical}
                  {...props}
                  id="newServiceBusNamespaceConnection"
                  mouseOverToolTip={undefined}
                />
                {!namespaceAuthRules && <LoadingComponent />}
                {!!namespaceAuthRules && namespaceAuthRules.length === 0 ? (
                  <p>{t('serviceBusPicker_noPolicies')}</p>
                ) : (
                  <>
                    <Dropdown
                      label={t('serviceBusPicker_policy')}
                      options={policyOptions}
                      selectedKey={formValues.policy && formValues.policy.id}
                      onChange={(o, e) => {
                        setFormValues({ ...formValues, policy: e && e.data });
                        setKeyList(undefined);
                      }}
                      errorMessage={undefined}
                      layout={Layout.Vertical}
                      {...props}
                      id="newServiceBusPolicyConnection"
                      mouseOverToolTip={undefined}
                    />
                    {!keyList && <LoadingComponent />}
                  </>
                )}
              </>
            )}
            <footer style={paddingTopStyle}>
              <PrimaryButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setServiceBusConnection = (
  formValues: ServiceBusPivotFormValues,
  keyList: KeyList | undefined,
  appSettingKeys: string[],
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.namespace && keyList) {
    const appSettingName = generateAppSettingName(appSettingKeys, `${formValues.namespace.name}_${keyList.keyName}_SERVICEBUS`);
    const appSettingValue = keyList.primaryConnectionString;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setIsDialogVisible(false);
  }
};

export default EventHubPivot;
