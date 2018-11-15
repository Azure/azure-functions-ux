import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { style } from 'typestyle';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';
import { connect } from 'react-redux';
import IState from 'src/modules/types';
import { compose } from 'recompose';
interface FormActionBarProps {
  save: () => void;
  cancel: () => void;
  valid: boolean;
  errorMessage?: string;
  id: string;
}

interface FormActionBarState {
  theme: ThemeExtended;
}
const elementWrapperStyle = style({
  position: 'absolute',
  bottom: '0px',
  height: '57px',
  left: '0px',
  right: '0px',
  overflow: 'hidden',
});

const buttonsWrapperStyle = (theme: ThemeExtended) =>
  style({
    borderTop: `1px solid ${theme.palette.neutralDark}`,
    padding: '16px 25px',
    position: 'relative',
    overflow: 'hidden',
    display: 'block',
  });

const primaryButtonStyle = style({
  marginRight: '8px',
});

type FormActionBarPropsCombined = FormActionBarProps & InjectedTranslateProps & FormActionBarState;
const FormActionBar: React.SFC<FormActionBarPropsCombined> = ({ save, valid, cancel, t, id, theme, ...props }) => {
  return (
    <div className={elementWrapperStyle}>
      <div className={buttonsWrapperStyle(theme)}>
        <PrimaryButton id={`${id}-save`} className={primaryButtonStyle} onClick={save} disabled={!valid}>
          {t('save')}
        </PrimaryButton>
        <DefaultButton id={`${id}-cancel`} onClick={cancel}>
          {t('cancel')}
        </DefaultButton>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => {
  return {
    theme: state.portalService.theme,
  };
};
export default compose<FormActionBarPropsCombined, FormActionBarProps>(
  translate('translation'),
  connect(
    mapStateToProps,
    null
  )
)(FormActionBar);
