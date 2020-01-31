import React, { useState, useEffect, useContext } from 'react';
import { IDropdownOption, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Namespace, AuthorizationRule, KeyList } from '../../../../../../models/servicebus';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FormikProps, Formik, FieldProps } from 'formik';
import { ServiceBusPivotContext } from './ServiceBusPivotDataLoader';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';

export interface ServiceBusPivotFormValues {
  namespace: ArmObj<Namespace> | undefined;
  policy: ArmObj<AuthorizationRule> | undefined;
}

const EventHubPivot: React.SFC<NewConnectionCalloutProps & IDropdownProps & FieldProps & CustomDropdownProps> = props => {
  const provider = useContext(ServiceBusPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<ServiceBusPivotFormValues>({ namespace: undefined, policy: undefined });
  const [namespaces, setNamespaces] = useState<ArmObj<Namespace>[] | undefined>(undefined);
  const [namespaceAuthRules, setNamespaceAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!namespaces) {
      provider.fetchNamespaces(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getNamespaces', `Failed to get Namespaces: ${r.metadata.error}`);
          return;
        }
        setNamespaces(r.data.value);
      });
    } else if (formValues.namespace) {
      if (!namespaceAuthRules) {
        provider.fetchAuthRules(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
            return;
          }
          setNamespaceAuthRules(r.data.value);
        });
      }
      if (formValues.policy && !keyList) {
        provider.fetchKeyList(formValues.policy.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
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
        setServiceBusConnection(formValues, keyList, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)
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
                  {...props}
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
                      {...props}
                    />
                    {!keyList && <LoadingComponent />}
                  </>
                )}
              </>
            )}
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
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
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.namespace && keyList) {
    const appSettingName = `${formValues.namespace.name}_${keyList.keyName}_SERVICEBUS`;
    const appSettingValue = keyList.primaryKey;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default EventHubPivot;
