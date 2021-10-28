import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { CommandBarButtonStyle } from '../pages/app/app-settings/AppSettings.styles';
import { CommandBarButton, IButtonProps } from '@fluentui/react';

export const CustomCommandBarButton: React.FC<IButtonProps> = props => {
  const theme = useContext(ThemeContext);
  return (
    <CommandBarButton
      {...props}
      data-cy={`command-button-${props.name}`}
      onClick={props.onClick}
      styles={CommandBarButtonStyle(props, theme)}
    />
  );
};
