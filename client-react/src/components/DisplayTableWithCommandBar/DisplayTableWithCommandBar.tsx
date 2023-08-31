import React, { useContext } from 'react';
import { ICommandBarItemProps, CommandBar, IDetailsListProps, IButtonProps, ICommandBar } from '@fluentui/react';
import { ThemeContext } from '../../ThemeContext';
import { commandBarStyles, DetailListStyles } from './DisplayTableWithCommandBar.style';
import DisplayTableCommandBarButton from './DisplayTableCommandBarButton';
import DisplayTableWithEmptyMessage, {
  DisplayTableWithEmptyMessageProps,
} from '../DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { useTranslation } from 'react-i18next';

interface DisplayTableWithCommandBarProps {
  commandBarRef?: React.MutableRefObject<ICommandBar | null>;
  commandBarItems?: ICommandBarItemProps[];
}

type Props = DisplayTableWithEmptyMessageProps & DisplayTableWithCommandBarProps & IDetailsListProps;
const DisplayTableWithCommandBar: React.SFC<Props> = props => {
  const { commandBarItems, styles, commandBarRef, ...rest } = props;
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
          componentRef={ref => {
            if (commandBarRef) {
              commandBarRef.current = ref;
            }
          }}
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
