import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { compose } from 'recompose';
import IState from '../../../modules/types';
import { connect } from 'react-redux';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import { style } from 'typestyle';

interface StatusMessage {
  message: string;
  level: MessageBarType;
  infoLink?: string;
}

interface SpecPickerFooterProps {
  submitButtonTitle: string;
  submitButtonDisabled: boolean;
  submitButtonOnClick: () => void;
  showDiscardButton: boolean;
  discardButtonDisabled: boolean;
  discardButtonOnClick: () => void;
  statusMessage?: StatusMessage;
}

interface IStateProps {
  theme: ITheme;
}

const primaryButtonStyle = style({
  margin: 'none',
});

const defaultButtonStyle = style({
  marginLeft: '10px',
});

const buttonDiv = style({
  display: 'inline-block',
  verticalAlign: 'top',
  paddingTop: '10px',
});

const statusMessageDiv = style({
  display: 'inline-block',
});

type SpecPickerFooterPropsCombined = SpecPickerFooterProps & InjectedTranslateProps & IStateProps;
class SpecPickerFooter extends React.Component<SpecPickerFooterPropsCombined, any> {
  public render() {
    const {
      showDiscardButton,
      discardButtonOnClick,
      discardButtonDisabled,
      submitButtonTitle,
      submitButtonDisabled,
      submitButtonOnClick,
      statusMessage,
      t,
      theme,
    } = this.props;

    const footerDivStyle = style({
      backgroundColor: theme.semanticColors.defaultStateBackground,
      bottom: '0px',
      height: '55px',
      width: '100%',
      padding: '0px 5px',
      borderTop: '1px solid',
      borderTopColor: theme.semanticColors.inputBorder,
    });

    return (
      <div className={footerDivStyle}>
        <div className={buttonDiv}>
          <PrimaryButton onClick={submitButtonOnClick} disabled={submitButtonDisabled} className={primaryButtonStyle}>
            {t(submitButtonTitle)}
          </PrimaryButton>
          {showDiscardButton && (
            <DefaultButton onClick={discardButtonOnClick} disabled={discardButtonDisabled} className={defaultButtonStyle}>
              {t('Discard')}
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
              {!!statusMessage.infoLink && <Link href={statusMessage.infoLink}>{t('Learn more')}</Link>}
            </MessageBar>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  theme: state.portalService.theme,
});
export default compose<SpecPickerFooterPropsCombined, SpecPickerFooterProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(SpecPickerFooter);
