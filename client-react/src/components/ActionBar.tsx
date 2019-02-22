import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import { ThemeExtended } from '../theme/SemanticColorsExtended';
import { SpinnerSize, Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { ThemeContext } from '../ThemeContext';

interface StatusMessage {
  message: string;
  level: MessageBarType;
  infoLink?: string;
}

interface ActionBarButtonProps {
  id: string;
  title: string;
  disable: boolean;
  onClick: () => void;
}
interface ActionBarProps {
  id: string;
  primaryButton: ActionBarButtonProps;
  secondaryButton?: ActionBarButtonProps;
  statusMessage?: StatusMessage;
  validating?: boolean;
}

const elementWrapperStyle = (theme: ThemeExtended) =>
  style({
    position: 'absolute',
    bottom: '0px',
    height: '57px',
    left: '0px',
    right: '0px',
    overflow: 'hidden',
    borderTop: `1px solid ${theme.palette.neutralDark}`,
    zIndex: 1,
  });

const buttonsWrapperStyle = style({
  display: 'inline-block',
  verticalAlign: 'top',
  paddingTop: '10px',
});

const buttonStyle = style({
  marginLeft: '16px',
  marginTop: '2px',
});

const statusMessageDiv = style({
  display: 'inline-block',
  marginTop: '5px',
});

type ActionBarPropsCombined = ActionBarProps;
const ActionBar: React.FC<ActionBarPropsCombined> = ({ primaryButton, secondaryButton, validating, id, statusMessage }) => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  return (
    <div className={elementWrapperStyle(theme)}>
      <div className={buttonsWrapperStyle}>
        <PrimaryButton
          id={`${id}-${primaryButton.id}`}
          className={buttonStyle}
          onClick={primaryButton.onClick}
          disabled={primaryButton.disable}>
          {t(primaryButton.title)}
        </PrimaryButton>
        {secondaryButton && (
          <DefaultButton
            id={`${id}-${secondaryButton.id}`}
            className={buttonStyle}
            onClick={secondaryButton.onClick}
            disabled={secondaryButton.disable}>
            {t('cancel')}
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
            label={t('validating')}
            ariaLive="assertive"
            styles={{
              root: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
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
    </div>
  );
};
export default ActionBar;
