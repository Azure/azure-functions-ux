import React, { useContext } from 'react';

import { ActionButton, IButtonProps } from '@fluentui/react';

import { ThemeContext } from '../../ThemeContext';

import { tableCommandBarButtonStyle } from './DisplayTableWithCommandBar.style';

const DisplayTableCommandBarButton: React.FC<IButtonProps> = props => {
  const theme = useContext(ThemeContext);

  return <ActionButton {...props} styles={tableCommandBarButtonStyle(theme)} />;
};

export default DisplayTableCommandBarButton;
