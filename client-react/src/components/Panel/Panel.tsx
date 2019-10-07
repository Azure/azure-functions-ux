import React, { useContext } from 'react';
import { Panel as OfficePanel, IPanelProps, PanelType } from 'office-ui-fabric-react';
import { ReactComponent as CloseSvg } from '../../images/Common/close.svg';
import { useTranslation } from 'react-i18next';
import { panelStyle, panelHeaderStyle, panelBodyStyle, closeButtonStyle } from './Panel.styles';
import { ThemeContext } from '../../ThemeContext';

interface CustomPanelProps {
  style?: {};
}

const Panel: React.SFC<CustomPanelProps & IPanelProps> = props => {
  const { headerText, onDismiss, isOpen, type, style: customPanelStyle } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  let allPanelStyle = panelStyle;

  if (customPanelStyle) {
    allPanelStyle = Object.assign(panelStyle, customPanelStyle);
  }

  const onRenderNavigationContent = () => {
    return (
      <div className={panelHeaderStyle}>
        {headerText && <h3>{headerText}</h3>}
        <CloseSvg
          onClick={() => onDismiss && onDismiss()}
          tabIndex={0}
          role="button"
          aria-label={t('close')}
          className={closeButtonStyle(theme)}
        />
      </div>
    );
  };

  return (
    <OfficePanel
      isOpen={isOpen === undefined ? true : isOpen}
      onRenderNavigationContent={onRenderNavigationContent}
      type={type ? type : PanelType.large}
      styles={allPanelStyle}
      closeButtonAriaLabel={t('close')}>
      <div style={panelBodyStyle}>{props.children}</div>
    </OfficePanel>
  );
};

export default Panel;
