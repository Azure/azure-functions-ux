import { IPanelProps, Overlay, Panel, PanelType } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseSvg } from '../../images/Common/close.svg';
import { ThemeContext } from '../../ThemeContext';
import { closeButtonStyle, closeButtonSvgStyle, panelBodyStyle, panelHeaderStyle, panelStyle } from './CustomPanel.styles';

type IPanelPropsReduced = Pick<IPanelProps, Exclude<keyof IPanelProps, 'styles' | 'closeButtonAriaLabel' | 'onRenderNavigationContent'>>;

interface CustomPanelProps {
  customStyle?: {};
  headerContent?: JSX.Element;
  overlay?: boolean;
}

const CustomPanel: React.SFC<CustomPanelProps & IPanelPropsReduced> = props => {
  const { headerText, isOpen, type, customStyle, headerContent, overlay, ...rest } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  let allPanelStyle = panelStyle;

  if (customStyle) {
    allPanelStyle = Object.assign(panelStyle, customStyle);
  }

  const onRenderNavigationContent = panelProps => {
    const onClick = panelProps.onDismiss && (() => panelProps.onDismiss());

    return (
      <div className={panelHeaderStyle}>
        {headerText && <h3>{headerText}</h3>}
        <button onClick={onClick} className={closeButtonStyle(theme)}>
          <CloseSvg role="button" aria-label={t('close')} className={closeButtonSvgStyle()} focusable="true" />
        </button>
        {!!headerContent && headerContent}
      </div>
    );
  };

  return (
    <Panel
      layerProps={{
        eventBubblingEnabled: true,
      }}
      isOpen={isOpen === undefined ? true : isOpen}
      type={type ? type : PanelType.large}
      styles={allPanelStyle}
      onRenderNavigationContent={onRenderNavigationContent}
      {...rest}>
      <div style={panelBodyStyle}>{props.children}</div>
      {overlay && <Overlay />}
    </Panel>
  );
};

export default CustomPanel;
