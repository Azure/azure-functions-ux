import React from 'react';
import SpecPickerGroupTab, { SpecPickerGroupTabProps } from './SpecPickerGroupTab';
import { groupTabsNavStyle } from './SpecPicker.styles';

interface SpecPickerGroupTabsProps {
  tabs: SpecPickerGroupTabProps[];
}

const SpecPickerGroupTabs: React.FC<SpecPickerGroupTabsProps> = props => {
  const { tabs } = props;
  const tabItemElements: JSX.Element[] = [];

  for (const tab of tabs) {
    const tabProps = {
      ...tab,
    };
    tabItemElements.push(<SpecPickerGroupTab {...tabProps} />);
  }

  return (
    <nav role="tablist" className={groupTabsNavStyle}>
      {tabItemElements}
    </nav>
  );
};

export default SpecPickerGroupTabs;
