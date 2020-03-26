import i18next from 'i18next';
import { CommandBar, ICommandBarItemProps, ICommandBarStyles, ProgressIndicator } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomCommandBarButton } from '../../../../../../components/CustomCommandBarButton';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../../ThemeContext';

export interface EditBindingCommandBarProps {
  submitForm: () => void;
  resetForm: () => void;
  delete: () => void;
  dirty: boolean;
  loading: boolean;
  valid: boolean;
  disabled: boolean;
}

export const CommandBarStyles = (theme: ThemeExtended, loading: boolean): ICommandBarStyles => {
  const { semanticColors } = theme;
  return {
    root: [
      {
        height: '40px',
        borderBottom: !loading ? '1px solid rgba(204,204,204,.8)' : 'none',
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
  const { loading } = props;
  const theme = useContext(ThemeContext);
  const commandBarStyles = CommandBarStyles(theme, loading);

  return (
    <>
      <CommandBar
        items={getItems(props, t)}
        role="nav"
        styles={commandBarStyles}
        ariaLabel={t('editBindingCommands')}
        buttonAs={CustomCommandBarButton}
      />
      {loading && <ProgressIndicator />}
    </>
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
      disabled: props.disabled || !props.dirty || !props.valid,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: props.submitForm,
    },
    {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'ChromeClose',
      },
      disabled: props.disabled || !props.dirty,
      ariaLabel: t('appSettingsDiscardAriaLabel'),
      onClick: props.resetForm,
    },
    {
      key: 'delete',
      name: t('delete'),
      iconProps: {
        iconName: 'Delete',
      },
      disabled: props.disabled,
      ariaLabel: t('delete'),
      onClick: props.delete,
    },
  ];
};

export default EditBindingCommandBar;
