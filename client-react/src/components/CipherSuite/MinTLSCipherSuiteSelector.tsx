import React from 'react';
import { FieldProps } from 'formik';
import { Link, Text } from '@fluentui/react';
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
import { ThemeContext } from '../../ThemeContext';
import { useContext } from 'react';
import { Links } from '../../utils/FwLinks';

export interface MinTLSCipherSuiteSelectorProps {
  onChange?: (_e, checked: boolean) => void;
  infoBubbleMessage?: string;
  id: string;
  label: string;
  isIsolated: boolean;
  disabled: boolean;
}

// cipherSuites ordered from most secure to least secure
const cipherSuites = Object.values(CipherSuite);
const leastSecureCipherSuite = cipherSuites[cipherSuites.length - 1];

// TODO (tmauldin): Get these values from backend once API is available
const cipherOptions = cipherSuites.map(value => {
  return { key: value, text: value };
});

const MinTLSCipherSuiteSelector: React.FC<MinTLSCipherSuiteSelectorProps & FieldProps> = props => {
  const { field, form, isIsolated, disabled } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const initialCipherSuite = field.value ? field.value : leastSecureCipherSuite;
  const cipherSuiteFieldValue =
    initialCipherSuite !== leastSecureCipherSuite ? initialCipherSuite : `${initialCipherSuite} (${t('defaultUpperCase')})`;

  const [showCipherSuitePanel, setShowCipherSuitePanel] = React.useState(false);
  const [selectedCipherSuite, setSelectedCipherSuite] = React.useState(initialCipherSuite);

  const dismissPanel = React.useCallback(() => {
    setShowCipherSuitePanel(false);
  }, [setShowCipherSuitePanel]);

  const saveSelection = React.useCallback(() => {
    form.setFieldValue(field.name, selectedCipherSuite);
    dismissPanel();
  }, [form.setFieldValue, dismissPanel, selectedCipherSuite]);

  const onSelectionChange = React.useCallback(
    (_: unknown, option: IDropdownOption) => {
      setSelectedCipherSuite(option.text);
    },
    [setSelectedCipherSuite]
  );

  const openCipherSuitePanel = React.useCallback(() => {
    setSelectedCipherSuite(initialCipherSuite);
    setShowCipherSuitePanel(true);
  }, [setSelectedCipherSuite, setShowCipherSuitePanel, initialCipherSuite]);

  const actionBarPrimaryButtonProps = React.useMemo(
    () => ({
      id: 'save',
      title: t('ok'),
      onClick: saveSelection,
      disable: false,
    }),
    [saveSelection]
  );

  const actionBarSecondaryButtonProps = React.useMemo(
    () => ({
      id: 'cancel',
      title: t('cancel'),
      onClick: dismissPanel,
      disable: false,
    }),
    [dismissPanel]
  );

  const cipherDisplayOptions = React.useMemo(() => {
    let hitSelected = false;
    return cipherSuites.map((cipherSuite, index) => {
      // Appending to the cipher suite label to indicate if it is the most/least secure suite,
      // and if it is currently selected.

      let label: string = cipherSuite;

      if (selectedCipherSuite === cipherSuite) {
        hitSelected = true;
        label = `${label} (${t('selected')})`;
      }

      if (index == 0) {
        label = `${label} (${t('minTlsCipherSuiteMostSecure')})`;
      } else if (index == cipherSuites.length - 1) {
        label = `${label} (${t('minTlsCipherSuiteLeastSecure')})`;
      }

      return { label: label, disabled: hitSelected && selectedCipherSuite != cipherSuite };
    });
  }, [selectedCipherSuite, t]);

  return (
    <ReactiveFormControl {...props}>
      <>
        <div>
          {cipherSuiteFieldValue}{' '}
          <Link onClick={openCipherSuitePanel} disabled={disabled}>
            {t('change')}
          </Link>
        </div>
        <CustomPanel
          isOpen={showCipherSuitePanel}
          onDismiss={dismissPanel}
          type={PanelType.medium}
          headerText={t('minTlsCipherSuitePanelHeader')}>
          <div className={cipherSuiteStyle.verticalFlexBox}>
            <MessageBar messageBarType={MessageBarType.info}>
              <span>{t('minTlsCipherSuiteBannerInfo')}</span>
              {isIsolated && <span>{t('minTlsCipherSuiteASEBannerInfo')}</span>}
              {isIsolated && (
                <span>
                  <Link href={Links.minTlsCipherSuiteASE} target="_blank">
                    {t('learnMore')}
                  </Link>
                </span>
              )}
            </MessageBar>
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
              {cipherDisplayOptions.map((cipherDisplayOption, index) => (
                <span key={index}>
                  {cipherDisplayOption.disabled ? (
                    <ErrorSvg className={cipherSuiteStyle.icon} />
                  ) : (
                    <SuccessSvg className={cipherSuiteStyle.icon} />
                  )}
                  <Text className={cipherSuiteSelectorStyle(theme, cipherDisplayOption.disabled)}>{cipherDisplayOption.label}</Text>
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
