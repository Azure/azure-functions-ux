import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { style } from 'typestyle';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ThemeContext } from '../../../../ThemeContext';
import { PortalContext } from '../../../../PortalContext';
import { AppSettingsFormProps } from '../AppSettings.types';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

const linkStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.actionLink,
    cursor: 'pointer',
  });

const HostJsonConfiguration: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t } = props;
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const openHostJson = () => {
    portalContext.openFrameBlade(
      {
        detailBlade: 'FunctionsAppFilesFrameBladeReact',
        detailBladeInputs: { id: props.initialValues.site.id },
      },
      'configuration'
    );
  };

  return (
    <ReactiveFormControl label={'Host Configuration'} id="function-app-settings-hostjson-configuration">
      <div
        id="function-app-settings-hostjson-configuration"
        aria-labelledby="function-app-settings-hostjson-configuration-label"
        className={linkStyle(theme)}
        onClick={() => openHostJson()}>
        {t('Configure host.json')}
      </div>
    </ReactiveFormControl>
  );
};

export default withTranslation('translation')(HostJsonConfiguration);
