import React from 'react';
import SpecPickerGroupTab, { SpecPickerGroupTabProps } from './SpecPickerGroupTab';
import { groupTabsNavStyle } from './SpecPicker.styles';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';

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
    <FocusZone className={groupTabsNavStyle} direction={FocusZoneDirection.horizontal}>
      {tabItemElements}
    </FocusZone>
  );
};

export default SpecPickerGroupTabs;
