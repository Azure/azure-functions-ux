import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import { ThemeContext } from '../../../ThemeContext';
import { gridContainerStyle, gridHeaderItemStyle, gridItemStyle } from './StaticSiteSkuPicker.styles';

export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}

export enum StaticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = props => {
  const { isStaticSiteCreate, currentSku } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const [selectedSku, setSelectedSku] = useState<StaticSiteSku>(StaticSiteSku.Free);

  useEffect(() => {
    setSelectedSku(currentSku === StaticSiteSku.Standard ? StaticSiteSku.Standard : StaticSiteSku.Free);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isStaticSiteCreate && <h3>{t('staticSitePlanComparison')}</h3>}

      <div className={gridContainerStyle}>
        <div className={gridHeaderItemStyle(theme)}>{t('Plan/Features')}</div>
        <div className={gridHeaderItemStyle(theme)}>
          {t('Free')}
          <RadioButtonNoFormik
            id="static-site-sku"
            selectedKey={selectedSku}
            options={[
              {
                key: StaticSiteSku.Free,
                text: t('Free'),
              },
            ]}
          />
        </div>
        <div className={gridHeaderItemStyle(theme)}>
          {t('Standard')}
          <RadioButtonNoFormik
            id="static-site-sku"
            selectedKey={selectedSku}
            options={[
              {
                key: StaticSiteSku.Standard,
                text: t('Standard'),
              },
            ]}
          />
        </div>
        <div className={gridHeaderItemStyle(theme)}>{t('Price')}</div>
        <div className={gridItemStyle(theme)}>{t('Free')}</div>
        <div className={gridItemStyle(theme)}>{t('$9/month')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteIncludedBandwidth')}</div>
        <div className={gridItemStyle(theme)}>{t('100GB per subscription')}</div>
        <div className={gridItemStyle(theme)}>{t('100GB per subscription')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteBandwidthCoverage')}</div>
        <div className={gridItemStyle(theme)}>{t(' - ')}</div>
        <div className={gridItemStyle(theme)}>{t('$0.02 perGB per subscription')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteCustomDomains')}</div>
        <div className={gridItemStyle(theme)}>{t('2 per app')}</div>
        <div className={gridItemStyle(theme)}>{t('5 per app')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteSslCertificates')}</div>
        <div className={gridItemStyle(theme)}>{t('Free')}</div>
        <div className={gridItemStyle(theme)}>{t('Free')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteCustomAuthentication')}</div>
        <div className={gridItemStyle(theme)}>{t(' - ')}</div>
        <div className={gridItemStyle(theme)}>{t('Yes')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSitePrivateLink')}</div>
        <div className={gridItemStyle(theme)}>{t(' - ')}</div>
        <div className={gridItemStyle(theme)}>{t('Yes')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteStorage')}</div>
        <div className={gridItemStyle(theme)}>{t('0.25 GB')}</div>
        <div className={gridItemStyle(theme)}>{t('2GB')}</div>
        <div className={gridHeaderItemStyle(theme)}>{t('staticSiteAzureFunctions')}</div>
        <div className={gridItemStyle(theme)}>{t('Managed')}</div>
        <div className={gridItemStyle(theme)}>{t('Managed or bring your own')}</div>
      </div>
    </>
  );
};

export default StaticSiteSkuPicker;
