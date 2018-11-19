import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { style } from 'typestyle';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';
import { connect } from 'react-redux';
import IState from 'src/modules/types';
import { compose } from 'recompose';

interface StatusMessage {
  message: string;
  level: MessageBarType;
  infoLink?: string;
}

interface ActionBarButtonProps {
  title: string;
  disable: boolean;
  onClick: () => void;
}
interface ActionBarProps {
  id: string;
  primaryButton: ActionBarButtonProps;
  secondaryButton?: ActionBarButtonProps;
  statusMessage?: StatusMessage;
}

interface ActionBarState {
  theme: ThemeExtended;
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

type ActionBarPropsCombined = ActionBarProps & InjectedTranslateProps & ActionBarState;
const ActionBar: React.SFC<ActionBarPropsCombined> = ({ primaryButton, secondaryButton, t, id, theme, statusMessage, ...props }) => {
  return (
    <div className={elementWrapperStyle(theme)}>
      <div className={buttonsWrapperStyle}>
        <PrimaryButton
          id={`${id}-${primaryButton.title}`}
          className={buttonStyle}
          onClick={primaryButton.onClick}
          disabled={primaryButton.disable}>
          {t(primaryButton.title)}
        </PrimaryButton>
        {secondaryButton && (
          <DefaultButton
            id={`${id}-${secondaryButton}`}
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
                backgroundColor: 'transparent',
              },
            }}>
            {t(statusMessage.message)}
            {!!statusMessage.infoLink && (
              <Link href={statusMessage.infoLink} target="_blank">
                {t('Learn more')}
              </Link>
            )}
          </MessageBar>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  return {
    theme: state.portalService.theme,
  };
};
export default compose<ActionBarPropsCombined, ActionBarProps>(
  translate('translation'),
  connect(
    mapStateToProps,
    null
  )
)(ActionBar);
