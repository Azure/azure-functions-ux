import React from 'react';
import { FieldProps } from 'formik';
import { Link } from '@fluentui/react/lib/components/Link';
import { Text } from '@fluentui/react/lib/components/Text';
import CustomPanel from '../CustomPanel/CustomPanel';
import { CipherSuite } from '../../models/site/site';
import { PanelType } from '@fluentui/react/lib/Panel';
import ReactiveFormControl from '../form-controls/ReactiveFormControl';
import DropdownNoFormik from '../form-controls/DropDownnoFormik';
import { IDropdownOption, MessageBar, MessageBarType } from '@fluentui/react';
import { cipherSuiteSelectorStyle, cipherSuiteStyle } from './MinTLSCipherSuiteSelector.styles';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorSvg } from '../../images/Common/Error.svg';
import { ReactComponent as SuccessSvg } from '../../images/Common/Success.svg';
import ActionBar from '../ActionBar';

export interface MinTLSCipherSuiteSelectorProps {
  id: string;
  infoBubbleMessage?: string;
  label: string;
  onChange?: (_e, checked: boolean) => void;
}

const cipherSuites = Object.values(CipherSuite);

// TODO (tmauldin): Get these values from backend once API is available
const cipherOptions = cipherSuites.map(value => {
  return { key: value, text: value };
});

const MinTLSCipherSuiteSelector: React.FC<MinTLSCipherSuiteSelectorProps & FieldProps> = props => {
  const { field, form } = props;
  const { t } = useTranslation();

  const defaultCipherSuite = field.value ?? CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA;

  const [showCipherSuitePanel, setShowCipherSuitePanel] = React.useState(false);
  const [selectedCipherSuite, setSelectedCipherSuite] = React.useState(defaultCipherSuite);

  const dismissPanel = () => {
    setShowCipherSuitePanel(false);
  };

  const saveSelection = () => {
    form.setFieldValue(field.name, selectedCipherSuite);
    dismissPanel();
  };

  const onSelectionChange = (_: unknown, option: IDropdownOption) => {
    setSelectedCipherSuite(option.text);
  };

  const openCipherSuitePanel = () => {
    setSelectedCipherSuite(field.value);
    setShowCipherSuitePanel(true);
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: saveSelection,
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: dismissPanel,
    disable: false,
  };

  const cipherDisplayOptions = React.useMemo(() => {
    let hitSelected = false;
    return cipherSuites.map((value, i) => {
      // Appending to the cipher suite label to indicate if it is the most/least secure suite,
      // and if it is currently selected.

      let label: string = value;

      if (selectedCipherSuite === value) {
        hitSelected = true;
        label = `${label} (${t('selected')})`;
      }

      if (i == 0) {
        label = `${label} (${t('minTlsCipherSuiteMostSecure')})`;
      } else if (i == cipherSuites.length - 1) {
        label = `${label} (${t('minTlsCipherSuiteLeastSecure')})`;
      }

      const disabled = hitSelected && selectedCipherSuite != value;
      return { label: label, disabled: disabled };
    });
  }, [selectedCipherSuite, t]);

  return (
    <ReactiveFormControl {...props}>
      <>
        <div>
          {defaultCipherSuite} ({<Link onClick={openCipherSuitePanel}>{t('change')}</Link>})
        </div>
        <CustomPanel
          isOpen={showCipherSuitePanel}
          onDismiss={dismissPanel}
          type={PanelType.medium}
          headerText={t('minTlsCipherSuitePanelHeader')}>
          <div className={cipherSuiteStyle.verticalFlexBox}>
            <MessageBar messageBarType={MessageBarType.info}>{t('minTlsCipherSuiteBannerInfo')}</MessageBar>
            <div>
              <Text className={cipherSuiteStyle.dropdownHeader}>{t('minTlsCipherSuiteDropdownLabel')}</Text>
              <DropdownNoFormik
                widthOverride="90%"
                selectedKey={selectedCipherSuite}
                onChange={onSelectionChange}
                options={cipherOptions}
                id="app-settings-min-tls-cipher-dropdown"
              />
            </div>
            <Text className={cipherSuiteStyle.levelsDescription}>{t('minTlsCipherSuiteSelectionInfo')}</Text>
            <div className={cipherSuiteStyle.verticalFlexBoxMedGap}>
              {cipherDisplayOptions.map((item, i) => (
                <span key={i}>
                  {item.disabled ? <ErrorSvg className={cipherSuiteStyle.icon} /> : <SuccessSvg className={cipherSuiteStyle.icon} />}
                  <Text className={cipherSuiteSelectorStyle(item.disabled)}>{item.label}</Text>
                </span>
              ))}
            </div>
          </div>
          <ActionBar
            id="min-tls-cipher-suite-selector-footer"
            primaryButton={actionBarPrimaryButtonProps}
            secondaryButton={actionBarSecondaryButtonProps}
          />
        </CustomPanel>
      </>
    </ReactiveFormControl>
  );
};

export default MinTLSCipherSuiteSelector;
