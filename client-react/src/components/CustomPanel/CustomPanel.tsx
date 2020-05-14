import React, { useContext } from 'react';
import { Panel as OfficePanel, IPanelProps, PanelType, Overlay } from 'office-ui-fabric-react';
import { ReactComponent as CloseSvg } from '../../images/Common/close.svg';
import { useTranslation } from 'react-i18next';
import { panelStyle, panelHeaderStyle, panelBodyStyle, closeButtonStyle } from './CustomPanel.styles';
import { ThemeContext } from '../../ThemeContext';

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
    const onClick = panelProps.onDismiss && (() => panelProps.onDismiss!());
    return (
      <div className={panelHeaderStyle}>
        {headerText && <h3>{headerText}</h3>}
        <CloseSvg onClick={onClick} role="button" aria-label={t('close')} className={closeButtonStyle(theme)} />
        {!!headerContent && headerContent}
      </div>
    );
  };

  return (
    <OfficePanel
      isOpen={isOpen === undefined ? true : isOpen}
      type={type ? type : PanelType.large}
      styles={allPanelStyle}
      onRenderNavigationContent={onRenderNavigationContent}
      {...rest}>
      <div style={panelBodyStyle}>{props.children}</div>
      {overlay && <Overlay />}
    </OfficePanel>
  );
};

export default CustomPanel;
