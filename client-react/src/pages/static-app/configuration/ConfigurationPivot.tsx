import React, { useContext, useState } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import CustomTabRenderer from '../../app/app-settings/Sections/CustomTabRenderer';
import Configuration from './Configuration';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { ConfigurationPivotProps } from './Configuration.types';
import { getTelemetryInfo } from '../StaticSiteUtility';
import ConfigurationGeneralSettings from './ConfigurationGeneralSettings';
import { StaticSiteSku } from '../skupicker/StaticSiteSkuPicker.types';

const ConfigurationPivot: React.FC<ConfigurationPivotProps> = props => {
  const { isLoading, hasWritePermissions, formProps, staticSiteSku } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('appSettings');

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const isGeneralSettingsDisabled = isLoading || !hasWritePermissions || staticSiteSku === StaticSiteSku.Free;

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
      const data = {
        tabName: item.props.itemKey,
      };
      portalContext.log(getTelemetryInfo('info', 'tabClicked', 'clicked', data));
    }
  };

  const isAppSettingsDirty = (): boolean => {
    return !!formProps.values && formProps.values.isAppSettingsDirty;
  };

  const isGeneralSettingsDirty = (): boolean => {
    return !!formProps.values && formProps.values.isGeneralSettingsDirty;
  };

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      <PivotItem
        itemKey="appSettings"
        headerText={t('staticSite_applicationSettings')}
        ariaLabel={t('staticSite_applicationSettings')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isAppSettingsDirty, t('modifiedTag'))
        }>
        <Configuration {...props} />
      </PivotItem>
      <PivotItem
        itemKey="generalSettings"
        headerText={t('staticSite_generalSettings')}
        ariaLabel={t('staticSite_generalSettings')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isGeneralSettingsDirty, t('modifiedTag'))
        }>
        <ConfigurationGeneralSettings
          disabled={isGeneralSettingsDisabled}
          formProps={formProps}
          isLoading={isLoading}
          staticSiteSku={staticSiteSku}
        />
      </PivotItem>
    </Pivot>
  );
};

export default ConfigurationPivot;
