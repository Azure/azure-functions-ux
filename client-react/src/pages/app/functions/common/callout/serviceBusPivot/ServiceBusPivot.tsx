import { FieldProps, Formik, FormikProps } from 'formik';
import { DefaultButton, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { AuthorizationRule, KeyList, Namespace } from '../../../../../../models/servicebus';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
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
                <FormControlWrapper label={t('serviceBusPicker_namespace')} layout={Layout.vertical}>
                  <Dropdown
                    options={namespaceOptions}
                    selectedKey={formValues.namespace && formValues.namespace.id}
                    onChange={(o, e) => {
                      setFormValues({ namespace: e && e.data, policy: undefined });
                      setNamespaceAuthRules(undefined);
                      setKeyList(undefined);
                    }}
                    errorMessage={undefined}
                    {...props}
                  />
                </FormControlWrapper>
                {!namespaceAuthRules && <LoadingComponent />}
                {!!namespaceAuthRules && namespaceAuthRules.length === 0 ? (
                  <p>{t('serviceBusPicker_noPolicies')}</p>
                ) : (
                  <>
                    <FormControlWrapper label={t('serviceBusPicker_policy')} layout={Layout.vertical}>
                      <Dropdown
                        options={policyOptions}
                        selectedKey={formValues.policy && formValues.policy.id}
                        onChange={(o, e) => {
                          setFormValues({ ...formValues, policy: e && e.data });
                          setKeyList(undefined);
                        }}
                        errorMessage={undefined}
                        {...props}
                      />
                    </FormControlWrapper>
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
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
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
