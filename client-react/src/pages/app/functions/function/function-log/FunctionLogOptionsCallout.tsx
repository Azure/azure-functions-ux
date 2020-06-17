import React, { useContext } from 'react';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';
import { Callout, DirectionalHint, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { calloutStyle } from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../../../ThemeContext';
import { buttonStyle, buttonsWrapperStyle } from '../../../../../components/ActionBar';

interface FunctionLogOptionsCalloutProps {
  setIsDialogVisible: (isVisible: boolean) => void;
  setSelectedLoggingOption: (option: LoggingOptions) => void;
  dialogTarget: any;
}

const FunctionLogOptionsCallout: React.FC<FunctionLogOptionsCalloutProps> = props => {
  const { dialogTarget, setIsDialogVisible, setSelectedLoggingOption } = props;

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const primaryButtonOnClick = () => {
    setSelectedLoggingOption(LoggingOptions.fileBased);
    onCloseDialog();
  };

  return (
    <Callout
      role="alertdialog"
      gapSpace={380}
      target={dialogTarget}
      onDismiss={onCloseDialog}
      setInitialFocus={true}
      directionalHint={DirectionalHint.topCenter}
      isBeakVisible={true}>
      <div className={calloutStyle}>
        <div>{t('functionEditor_fileBasedLogsCalloutMessage')}</div>
        <div className={buttonsWrapperStyle}>
          <PrimaryButton id={`filesystem-logs-primary-button`} className={buttonStyle(theme, true)} onClick={primaryButtonOnClick}>
            {t('ok')}
          </PrimaryButton>
          <DefaultButton id={`filesystem-logs-secondary-button`} className={buttonStyle(theme, false)} onClick={onCloseDialog}>
            {t('cancel')}
          </DefaultButton>
        </div>
      </div>
    </Callout>
  );
};

export default FunctionLogOptionsCallout;
