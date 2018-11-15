import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { style } from 'typestyle';
interface FormActionBarProps {
  save: () => void;
  cancel: () => void;
  valid: boolean;
  errorMessage?: string;
  id: string;
}

const elementWrapperStyle = style({
  position: 'absolute',
  bottom: '0px',
  height: '57px',
  left: '0px',
  right: '0px',
  overflow: 'hidden',
});

const buttonsWrapperStyle = style({
  borderTop: '1px solid rgba(204,204,204,.5)',
  padding: '16px 25px',
  position: 'relative',
  overflow: 'hidden',
  display: 'block',
});

const primaryButtonStyle = style({
  marginRight: '8px',
});

const FormActionBar: React.SFC<FormActionBarProps & InjectedTranslateProps> = ({ save, valid, cancel, t, id, ...props }) => {
  return (
    <div className={elementWrapperStyle}>
      <div className={buttonsWrapperStyle}>
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

export default translate('translation')(FormActionBar);
