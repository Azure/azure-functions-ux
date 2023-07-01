import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import { DefaultButton, Link, MessageBar, MessageBarType, Overlay, PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';

import { ThemeExtended } from '../theme/SemanticColorsExtended';
import { ThemeContext } from '../ThemeContext';

export interface StatusMessage {
  message: string;
  level: MessageBarType;
  infoLink?: string;
}

interface ActionBarButtonProps {
  id: string;
  title: string | JSX.Element;
  disable: boolean;
  onClick: () => void;
  autoFocus?: boolean;
}
interface ActionBarProps {
  id: string;
  primaryButton: ActionBarButtonProps;
  secondaryButton?: ActionBarButtonProps;
  statusMessage?: StatusMessage;
  validating?: boolean;
  overlay?: boolean;
  fullPageHeight?: boolean;
  validationMessage?: string;
}

const elementWrapperStyle = (theme: ThemeExtended, fullPageHeight?: boolean) =>
  style({
    position: fullPageHeight ? 'fixed' : 'absolute',
    bottom: '0px',
    minHeight: '57px',
    left: '0px',
    right: '0px',
    overflow: 'hidden',
    borderTop: `1px solid rgba(127, 127, 127, 0.7)`,
    zIndex: 1,
    background: theme.semanticColors.bodyFrameBackground,
  });

export const buttonsWrapperStyle = style({
  display: 'inline-block',
  verticalAlign: 'top',
  paddingTop: '10px',
});

export const buttonStyle = (theme: ThemeExtended, isPrimary: boolean) =>
  style({
    marginLeft: '16px',
    marginTop: '2px',
    padding: '3px 20px',
    height: '24px',
    $nest: {
      '&:focus': {
        $nest: {
          '&::after': {
            top: '1px !important',
            right: '1px !important',
            bottom: '1px !important',
            left: '1px !important',
            borderStyle: 'dotted !important',
            borderColor: `${
              isPrimary ? theme.semanticColors.primaryButtonBorderFocused : theme.semanticColors.buttonBorderFocused
            } !important`,
            outlineStyle: 'dotted !important',
            outlineColor: `${theme.semanticColors.buttonOutlineFocused} !important`,
            outlineOffset: '1px !important',
          },
        },
      },
    },
  });

const statusMessageDiv = style({
  display: 'inline-block',
  marginTop: '5px',
});

type ActionBarPropsCombined = ActionBarProps;
const ActionBar: React.FC<ActionBarPropsCombined> = ({
  primaryButton,
  secondaryButton,
  validating,
  id,
  statusMessage,
  overlay,
  fullPageHeight,
  validationMessage,
}) => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const primaryButtonTitle = primaryButton.title;

  return (
    <div className={elementWrapperStyle(theme, fullPageHeight)}>
      <div className={buttonsWrapperStyle}>
        <PrimaryButton
          id={`${id}-${primaryButton.id}`}
          className={buttonStyle(theme, true)}
          onClick={primaryButton.onClick}
          disabled={primaryButton.disable}
          autoFocus={!!primaryButton.autoFocus}>
          {typeof primaryButtonTitle !== 'string' ? primaryButtonTitle : t(primaryButtonTitle)}
        </PrimaryButton>
        {secondaryButton && (
          <DefaultButton
            id={`${id}-${secondaryButton.id}`}
            className={buttonStyle(theme, false)}
            onClick={secondaryButton.onClick}
            disabled={secondaryButton.disable}>
            {secondaryButton.title}
          </DefaultButton>
        )}
      </div>
      <div className={statusMessageDiv}>
        {!!statusMessage && (
          <MessageBar
            messageBarType={statusMessage.level}
            isMultiline={false}
            styles={{
              root: {
                backgroundColor: 'rgba(0, 0, 0, 0.0)',
              },
            }}>
            {t(statusMessage.message)}
            {!!statusMessage.infoLink && (
              <Link href={statusMessage.infoLink} target="_blank">
                {t('learnMore')}
              </Link>
            )}
          </MessageBar>
        )}
        {validating && (
          <Spinner
            size={SpinnerSize.medium}
            label={validationMessage ?? t('validating')}
            ariaLive="assertive"
            styles={{
              root: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '10px',
                paddingLeft: '5px',
              },
              label: {
                alignSelf: 'center',
                paddingLeft: '5px',
                marginTop: '0px',
              },
            }}
          />
        )}
      </div>
      {overlay && <Overlay />}
    </div>
  );
};
export default ActionBar;
