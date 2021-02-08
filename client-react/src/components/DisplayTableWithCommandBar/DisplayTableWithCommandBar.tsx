import React, { useContext } from 'react';
import { ICommandBarItemProps, CommandBar, IDetailsListProps, IButtonProps } from 'office-ui-fabric-react';
import { ThemeContext } from '../../ThemeContext';
import { commandBarStyles, DetailListStyles } from './DisplayTableWithCommandBar.style';
import DisplayTableCommandBarButton from './DisplayTableCommandBarButton';
import DisplayTableWithEmptyMessage, {
  DisplayTableWithEmptyMessageProps,
} from '../DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { useTranslation } from 'react-i18next';

interface DisplayTableWithCommandBarProps {
  commandBarItems?: ICommandBarItemProps[];
}

type Props = DisplayTableWithEmptyMessageProps & DisplayTableWithCommandBarProps & IDetailsListProps;
const DisplayTableWithCommandBar: React.SFC<Props> = props => {
  const { commandBarItems, styles, ...rest } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  let customStyles = DetailListStyles();

  if (!!styles) {
    customStyles = Object.assign(customStyles, styles);
  }

  return (
    <>
      {!!commandBarItems && commandBarItems.length > 0 && (
        <CommandBar
          items={commandBarItems}
          role="nav"
          styles={commandBarStyles(theme)}
          buttonAs={DisplayTableCommandBarButton}
          overflowButtonProps={overflowButtonProps}
        />
      )}
      {props.children}
      <DisplayTableWithEmptyMessage styles={customStyles} {...rest} />
    </>
  );
};

export default DisplayTableWithCommandBar;
