import * as React from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib-commonjs/CommandBar';
import { InjectedTranslateProps, translate } from 'react-i18next';

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
const getItems = (saveFunction: any, discardFunction: any, dirty: boolean, t: (string) => string): ICommandBarItemProps[] => {
  return [
    {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: !dirty,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: 'Discard',
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: discardFunction,
    },
  ];
};
interface AppSettingsCommandBarProps {
  submitForm: () => void;
  resetForm: () => void;
  dirty: boolean;
}

const AppSettingsCommandBar: React.SFC<AppSettingsCommandBarProps & InjectedTranslateProps> = props => {
  return (
    <CommandBar
      items={getItems(props.submitForm, () => props.resetForm(), props.dirty, props.t)}
      ariaLabel={props.t('appSettingsCommandBarAriaLabel')}
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

export default translate()(AppSettingsCommandBar);
