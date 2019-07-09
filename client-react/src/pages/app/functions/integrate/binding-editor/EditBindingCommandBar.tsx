import React from 'react';
import { CommandBar, ICommandBarItemProps, ICommandBarStyleProps, ICommandBarStyles } from 'office-ui-fabric-react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';

export interface EditBindingCommandBarProps {
  submitForm: () => void;
  resetForm: () => void;
  delete: () => void;
  dirty: boolean;
}

export const CommandBarStyles = (props: ICommandBarStyleProps): ICommandBarStyles => {
  const { theme } = props;
  const { semanticColors } = theme;
  return {
    root: [
      {
        height: '40px',
        borderBottom: '1px solid rgba(204,204,204,.8)',
        paddingBottom: '5px',
        paddingLeft: '15px',
        backgroundColor: semanticColors.bodyBackground,
        width: 'auto',
      },
    ],
  };
};

const EditBindingCommandBar: React.FC<EditBindingCommandBarProps> = props => {
  const { t } = useTranslation();

  return (
    <CommandBar
      items={getItems(props, t)}
      aria-role="nav"
      styles={CommandBarStyles}
      ariaLabel={'Edit binding command bar'}
      buttonAs={CustomCommandBarButton}
    />
  );
};

const getItems = (props: EditBindingCommandBarProps, t: i18next.TFunction): ICommandBarItemProps[] => {
  return [
    {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: !props.dirty,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: props.submitForm,
    },
    {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'ChromeClose',
      },
      disabled: !props.dirty,
      ariaLabel: t('appSettingsDiscardAriaLabel'),
      onClick: props.resetForm,
    },
    {
      key: 'delete',
      name: t('delete'),
      iconProps: {
        iconName: 'Delete',
      },
      disabled: !props.dirty,
      ariaLabel: 'Delete',
      onClick: props.resetForm,
    },
  ];
};

export default EditBindingCommandBar;
