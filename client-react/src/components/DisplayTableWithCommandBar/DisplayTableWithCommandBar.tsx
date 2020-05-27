import React, { useContext } from 'react';
import { ICommandBarItemProps, CommandBar, IDetailsListProps } from 'office-ui-fabric-react';
import { ThemeContext } from '../../ThemeContext';
import { commandBarStyles, DetailListStyles } from './DisplayTableWithCommandBar.style';
import DisplayTableCommandBarButton from './DisplayTableCommandBarButton';
import DisplayTableWithEmptyMessage, {
  DisplayTableWithEmptyMessageProps,
} from '../DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface DisplayTableWithCommandBarProps {
  commandBarItems?: ICommandBarItemProps[];
}

type Props = DisplayTableWithEmptyMessageProps & DisplayTableWithCommandBarProps & IDetailsListProps;
const DisplayTableWithCommandBar: React.SFC<Props> = props => {
  const { commandBarItems, styles, ...rest } = props;
  const theme = useContext(ThemeContext);

  let customStyles = DetailListStyles();

  if (!!styles) {
    customStyles = Object.assign(customStyles, styles);
  }

  return (
    <>
      {commandBarItems && (
        <CommandBar items={commandBarItems} role="nav" styles={commandBarStyles(theme)} buttonAs={DisplayTableCommandBarButton} />
      )}
      {props.children}
      <DisplayTableWithEmptyMessage styles={customStyles} {...rest} />
    </>
  );
};

export default DisplayTableWithCommandBar;
