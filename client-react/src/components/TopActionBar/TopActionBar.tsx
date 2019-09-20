import React from 'react';
import { Stack, ActionButton } from 'office-ui-fabric-react';

interface TopActionBarItemProps {
  id: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  styles?: any;
  iconName?: string;
  ariaLabel?: string;
}

interface TopActionBarProps {
  items: TopActionBarItemProps[];
}

const TopActionBar: React.FC<TopActionBarProps> = props => {
  const { items } = props;
  return (
    <Stack horizontal verticalAlign="center">
      {items.map((item, index) => {
        const { id, onClick, styles, disabled, iconName, buttonText, ariaLabel } = item;
        return (
          <ActionButton
            id={`${id}-${index}`}
            onClick={onClick}
            disabled={!!disabled}
            styles={styles ? styles : {}}
            iconProps={{ iconName: iconName ? iconName : '' }}
            ariaLabel={ariaLabel ? ariaLabel : buttonText}>
            {buttonText}
          </ActionButton>
        );
      })}
    </Stack>
  );
};

export default TopActionBar;
