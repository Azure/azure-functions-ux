import React, { useContext } from 'react';
import { IButtonProps, ActionButton } from '@fluentui/react';
import { tableCommandBarButtonStyle } from './DisplayTableWithCommandBar.style';
import { ThemeContext } from '../../ThemeContext';

const DisplayTableCommandBarButton: React.FC<IButtonProps> = props => {
  const theme = useContext(ThemeContext);

  return <ActionButton {...props} styles={tableCommandBarButtonStyle(theme)} />;
};

export default DisplayTableCommandBarButton;
