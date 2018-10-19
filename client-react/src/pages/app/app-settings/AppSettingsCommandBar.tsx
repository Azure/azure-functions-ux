import * as React from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib-commonjs/CommandBar';

// tslint:disable-next-line:member-ordering
const customButton = (props: IButtonProps) => {
  return (
    <CommandBarButton
      {...props}
      onClick={props.onClick}
      styles={{
        ...props.styles,
      }}
    />
  );
};

// Data for CommandBar
const getItems = (saveFunction: any, discardFunction: any, dirty: boolean): ICommandBarItemProps[] => {
  return [
    {
      key: 'save',
      name: 'Save',
      iconProps: {
        iconName: 'Save',
      },
      disabled: !dirty,
      ariaLabel: 'New. Use left and right arrow keys to navigate',
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: 'Discard',
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      onClick: discardFunction,
    },
  ];
};
interface AppSettingsCommandBarProps {
  submitForm: () => void;
  resetForm: () => void;
  dirty: boolean;
}

const AppSettingsCommandBar: React.SFC<AppSettingsCommandBarProps> = props => {
  return (
    <CommandBar
      items={getItems(props.submitForm, () => props.resetForm(), props.dirty)}
      ariaLabel={'Use left and right arrow keys to navigate between commands'}
      buttonAs={customButton}
      styles={{
        root: {
          borderBottom: '1px solid rgba(204,204,204,.8)',
          width: '100%',
        },
      }}
    />
  );
};

export default AppSettingsCommandBar;
