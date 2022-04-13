import React, { useContext } from 'react';
import { ThemeContext } from '../../../../../ThemeContext';
import { Icon } from '@fluentui/react';
import { markdownIconStyle } from './LocalCreateInstructions.style';

export const ChevronUp: React.FC = () => {
  const theme = useContext(ThemeContext);

  return <Icon iconName="ChevronUp" className={markdownIconStyle(theme)} />;
};
