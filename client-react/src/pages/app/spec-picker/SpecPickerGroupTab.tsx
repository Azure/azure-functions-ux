import React, { useContext } from 'react';
import ReactSVG from 'react-svg';
import { ThemeContext } from '../../../ThemeContext';
import { groupTabDivStyle, groupTabH1Style, groupTabH2Style, groupTabIconDivStyle, groupTabSelectedDivStyle } from './SpecPicker.styles';

export interface SpecPickerGroupTabProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  onClick: (id: string) => void;
  isSelected: boolean;
}

const SpecPickerGroupTab: React.FC<SpecPickerGroupTabProps> = props => {
  const theme = useContext(ThemeContext);
  const { id, icon, title, description, onClick, isSelected } = props;
  const tabId = `group-tab-item-${id}`;
  const className = isSelected ? `${groupTabSelectedDivStyle(theme)}` : groupTabDivStyle(theme);

  return (
    <div
      id={tabId}
      role="button"
      className={className}
      aria-label={title}
      onClick={() => {
        onClick(id);
      }}>
      <ReactSVG className={groupTabIconDivStyle} src={icon} />
      <h1 className={groupTabH1Style}>{title}</h1>
      <h2 className={groupTabH2Style}>{description}</h2>
    </div>
  );
};

export default SpecPickerGroupTab;
