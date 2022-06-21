import { IPivotItemProps, Pivot, PivotItem } from '@fluentui/react';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import CustomTabRenderer from '../../app/app-settings/Sections/CustomTabRenderer';
import { StaticSiteSku } from '../skupicker/StaticSiteSkuPicker.types';
import { getTelemetryInfo } from '../StaticSiteUtility';
import Configuration from './Configuration';
import { ConfigurationPivotProps } from './Configuration.types';
import ConfigurationGeneralSettings from './ConfigurationGeneralSettings';
import { useStyles } from './ConfigurationPivot.styles';

const ConfigurationPivot: React.FC<ConfigurationPivotProps> = (props: ConfigurationPivotProps) => {
  const { isLoading, hasWritePermissions, formProps, staticSiteSku } = props;

  const styles = useStyles();
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState('appSettings');

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const onLinkClick = useCallback(
    (item?: PivotItem) => {
      if (item?.props.itemKey) {
        setSelectedKey(item.props.itemKey);
        portalContext.log(
          getTelemetryInfo('info', 'tabClicked', 'clicked', {
            tabName: item.props.itemKey,
          })
        );
      }
    },
    [portalContext]
  );

  const isAppSettingsDirty = useCallback((): boolean => {
    return !!formProps.values?.isAppSettingsDirty;
  }, [formProps.values?.isAppSettingsDirty]);

  const isGeneralSettingsDirty = useCallback((): boolean => {
    return !!formProps.values?.isGeneralSettingsDirty;
  }, [formProps.values?.isGeneralSettingsDirty]);

  return (
    <Pivot selectedKey={selectedKey} styles={styles.pivot} onLinkClick={onLinkClick}>
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
          disabled={isLoading || !hasWritePermissions || staticSiteSku === StaticSiteSku.Free}
          formProps={formProps}
          isLoading={isLoading}
          staticSiteSku={staticSiteSku}
        />
      </PivotItem>
    </Pivot>
  );
};

export default ConfigurationPivot;
