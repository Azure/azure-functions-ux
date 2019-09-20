import React, { useContext } from 'react';
import { ICommandBarItemProps, CommandBar, IDetailsListProps } from 'office-ui-fabric-react';
import { ThemeContext } from '../../ThemeContext';
import { commandBarStyles } from './DisplayTableWithCommandBar.style';
import DisplayTableCommandBarButton from './DisplayTableCommandBarButton';
import DisplayTableWithEmptyMessage from '../DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface DisplayTableWithCommandBarProps {
  commandBarItems?: ICommandBarItemProps[];
  emptyMessage?: string;
}

const DisplayTableWithCommandBar: React.SFC<DisplayTableWithCommandBarProps & IDetailsListProps> = props => {
  const { commandBarItems } = props;
  const theme = useContext(ThemeContext);

  return (
    <>
      {commandBarItems && (
        <CommandBar items={commandBarItems} aria-role="nav" styles={commandBarStyles(theme)} buttonAs={DisplayTableCommandBarButton} />
      )}
      <DisplayTableWithEmptyMessage {...props} />
    </>
  );
};

export default DisplayTableWithCommandBar;
