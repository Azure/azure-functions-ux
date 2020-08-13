import React, { useContext } from 'react';
import { ThemeContext } from '../../../../../ThemeContext';
import { Icon } from 'office-ui-fabric-react';
import { markdownIconStyle } from './LocalCreateInstructions.style';

export const ChevronUp: React.FC<{}> = props => {
  const theme = useContext(ThemeContext);

  return <Icon iconName="ChevronUp" className={markdownIconStyle(theme)} />;
};
