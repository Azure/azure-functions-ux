import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandBar, IButtonProps, ICommandBarItemProps, IDetailsListProps } from '@fluentui/react';

import { ThemeContext } from '../../ThemeContext';
import DisplayTableWithEmptyMessage, {
  DisplayTableWithEmptyMessageProps,
} from '../DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

import DisplayTableCommandBarButton from './DisplayTableCommandBarButton';
import { commandBarStyles, DetailListStyles } from './DisplayTableWithCommandBar.style';

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

  if (styles) {
    customStyles = Object.assign(customStyles, styles);
  }

  return (
    <>
      {!!commandBarItems && commandBarItems.length > 0 && (
        <CommandBar
          items={commandBarItems}
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
