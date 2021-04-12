import { DefaultButton, IChoiceGroupOption, Icon, registerIcons } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { ReactComponent as CheckSvg } from '../../../images/Common/check.svg';
import {
  gridBottomSelectedItemStyle,
  gridContainerStyle,
  planFeatureItemStyle,
  gridSelectedItemStyle,
  gridUnselectedItemStyle,
  radioButtonStyle,
  skuTitleStyle,
  skuDescriptionStyle,
  planFeaturesTitleStyle,
  skuTitleSelectedStyle,
  skuTitleUnselectedStyle,
  iconStyle,
  buttonStyle,
  titleWithPaddingStyle,
  buttonFooterStyle,
  gridContextPaneContainerStyle,
} from './StaticSiteSkuPicker.styles';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';

export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}

registerIcons({
  icons: {
    check: <CheckSvg className={iconStyle} />,
  },
});

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = props => {
  const { isStaticSiteCreate, currentSku } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const [selectedSku, setSelectedSku] = useState<string>('Free');
  const [freeColumnClassName, setFreeColumnClassName] = useState<string>(gridSelectedItemStyle(theme));
  const [standardColumnClassName, setStandardColumnClassName] = useState<string>(gridUnselectedItemStyle(theme));

  const applyButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'applyButton', 'clicked', { selectedSku: selectedSku }));
    portalContext.closeSelf(selectedSku);
  };

  const saveButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'saveButton', 'clicked'));
    //TODO (stpelleg): update static site implementation
  };

  const getHeaderRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeaturesTitleStyle(theme)} aria-label={t('staticSitePlanFeaturesAriaLabel')}>
          {t('staticSitePlanFeatures')}
        </div>
        {getFreeSkuTitleSection()}
        {getStandardSkuTitleSection()}
      </>
    );
  };

  const getFreeSkuTitleSection = (): JSX.Element => {
    return (
      <>
        <div className={selectedSku === 'Free' ? skuTitleSelectedStyle(theme) : skuTitleUnselectedStyle(theme)}>
          <div className={radioButtonStyle}>
            <RadioButtonNoFormik
              id="static-site-sku"
              aria-label={t('staticSiteFreePlanAriaLabel')}
              selectedKey={selectedSku}
              options={[
                {
                  key: 'Free',
                  text: '',
                },
              ]}
              onChange={(e: any, configOptions: IChoiceGroupOption) => {
                setSelectedSku(configOptions.key);
              }}
            />
          </div>
          <div className={skuTitleStyle}>{t('staticSiteFree')}</div>
          <div className={skuDescriptionStyle}>{t('staticSiteFreeDescription')}</div>
        </div>
      </>
    );
  };

  const getStandardSkuTitleSection = (): JSX.Element => {
    return (
      <>
        <div className={selectedSku === 'Standard' ? skuTitleSelectedStyle(theme) : skuTitleUnselectedStyle(theme)}>
          <div className={radioButtonStyle}>
            <RadioButtonNoFormik
              id="static-site-sku"
              aria-label={t('staticStandardPlanAriaLabel')}
              selectedKey={selectedSku}
              options={[
                {
                  key: 'Standard',
                  text: '',
                },
              ]}
              onChange={(e: any, configOptions: IChoiceGroupOption) => {
                setSelectedSku(configOptions.key);
              }}
            />
          </div>
          <div className={skuTitleStyle}>{t('staticSiteStandard')}</div>
          <div className={skuDescriptionStyle}>{t('staticSiteStandardDescription')}</div>
        </div>
      </>
    );
  };

  const getPriceRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)} aria-label={t('Price')}>
          {t('Price')}
        </div>
        <div className={freeColumnClassName} aria-label={t('Price is free')}>
          {t('staticSiteFree')}
        </div>
        <div className={standardColumnClassName} aria-label={t('Price is nine dollars each month')}>
          {t('staticSiteStandardPrice')}
        </div>
      </>
    );
  };

  const getIncludedBandwidthRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteIncludedBandwidth')}</div>
        <div className={freeColumnClassName}>{t('staticSiteIncludedBandwidthAmount')}</div>
        <div className={standardColumnClassName}>{t('staticSiteIncludedBandwidthAmount')}</div>
      </>
    );
  };

  const getBandwidthOverageRow = (): JSX.Element => {
    //TODO (stpelleg): billing meter implementation
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteBandwidthOverage')}</div>
        <div className={freeColumnClassName}>{t(' - ')}</div>
        <div className={standardColumnClassName}>{t('staticSiteStandardBandwidthOverageAmount')}</div>
      </>
    );
  };

  const getCustomDomainsRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteCustomDomains')}</div>
        <div className={freeColumnClassName}>{t('staticSiteFreeCustomDomainAmount')}</div>
        <div className={standardColumnClassName}>{t('staticSiteStandardCustomDomainAmount')}</div>
      </>
    );
  };

  const getSslCertificatesRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteSslCertificates')}</div>
        <div className={freeColumnClassName}>{t('staticSiteFree')}</div>
        <div className={standardColumnClassName}>{t('staticSiteFree')}</div>
      </>
    );
  };

  const getCustomAuthenticationRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteCustomAuthentication')}</div>
        <div className={freeColumnClassName}>{t(' - ')}</div>
        <div className={standardColumnClassName}>{<Icon iconName={'check'} />}</div>
      </>
    );
  };

  const getPrivateLinkRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSitePrivateLink')}</div>
        <div className={freeColumnClassName}>{t(' - ')}</div>
        <div className={standardColumnClassName}>{<Icon iconName={'check'} />}</div>
      </>
    );
  };

  const getStorageRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteStorage')}</div>
        <div className={freeColumnClassName}>{t('staticSiteFreeStorageAmount')}</div>
        <div className={standardColumnClassName}>{t('staticSiteStandardStorageAmount')}</div>
      </>
    );
  };

  const getAzureFunctionsRow = (): JSX.Element => {
    const isFreeSelected: boolean = selectedSku === 'Free';
    return (
      <>
        <div className={planFeatureItemStyle(theme)}>{t('staticSiteAzureFunctions')}</div>
        <div className={isFreeSelected ? gridBottomSelectedItemStyle(theme) : freeColumnClassName}>
          {t('staticSiteFreeAzureFunctionsAmount')}
        </div>
        <div className={!isFreeSelected ? gridBottomSelectedItemStyle(theme) : standardColumnClassName}>
          {t('staticSiteStandardAzureFunctionsAmount')}
        </div>
      </>
    );
  };

  const gridRows: JSX.Element[] = [
    getHeaderRow(),
    getPriceRow(),
    getIncludedBandwidthRow(),
    getBandwidthOverageRow(),
    getCustomDomainsRow(),
    getSslCertificatesRow(),
    getCustomAuthenticationRow(),
    getPrivateLinkRow(),
    getStorageRow(),
    getAzureFunctionsRow(),
  ];

  useEffect(() => {
    if (currentSku) {
      setSelectedSku(currentSku);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isStandardSelected = selectedSku === 'Standard';
    setFreeColumnClassName(isStandardSelected ? gridUnselectedItemStyle(theme) : gridSelectedItemStyle(theme));
    setStandardColumnClassName(isStandardSelected ? gridSelectedItemStyle(theme) : gridUnselectedItemStyle(theme));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSku]);

  return (
    <>
      {isStaticSiteCreate && <h2 className={titleWithPaddingStyle}>{t('staticSitePlanComparison')}</h2>}

      <div className={isStaticSiteCreate ? gridContextPaneContainerStyle : gridContainerStyle}>{gridRows}</div>

      {isStaticSiteCreate && (
        <div className={buttonFooterStyle(theme)}>
          <DefaultButton text={t('staticSiteApply')} ariaLabel={t('staticSiteApply')} onClick={applyButtonOnClick} />
        </div>
      )}

      {!isStaticSiteCreate && (
        <div className={buttonStyle}>
          <DefaultButton
            text={t('Save')}
            ariaLabel={t('Save')}
            onClick={saveButtonOnClick}
            disabled={currentSku === 'Standard' || selectedSku === 'Free'}
          />
        </div>
      )}
    </>
  );
};

export default StaticSiteSkuPicker;
