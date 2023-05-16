import { IPanelProps, IPanelStyles, Overlay, Panel, PanelType } from '@fluentui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { panelBodyStyle, panelStyle } from './CustomPanel.styles';

type IPanelPropsReduced = Pick<IPanelProps, Exclude<keyof IPanelProps, 'styles' | 'closeButtonAriaLabel' | 'onRenderNavigationContent'>>;

interface CustomPanelProps {
  customStyle?: Partial<IPanelStyles>;
  overlay?: boolean;
}

const CustomPanel: React.FC<CustomPanelProps & IPanelPropsReduced> = props => {
  const { headerText, isOpen, type, customStyle, overlay, ...rest } = props;
  const { t } = useTranslation();

  let allPanelStyle = panelStyle;

  if (customStyle) {
    allPanelStyle = Object.assign(panelStyle, customStyle);
  }

  return (
    <Panel
      layerProps={{
        eventBubblingEnabled: true,
      }}
      headerText={headerText}
      isOpen={isOpen === undefined ? true : isOpen}
      type={type ? type : PanelType.large}
      styles={allPanelStyle}
      closeButtonAriaLabel={t('close')}
      {...rest}>
      <div style={panelBodyStyle}>{props.children}</div>
      {overlay && <Overlay />}
    </Panel>
  );
};

export default CustomPanel;
