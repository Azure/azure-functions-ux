import React, { useContext } from 'react';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';
import { Callout, DirectionalHint, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { calloutStyle } from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../../../ThemeContext';
import { buttonStyle, buttonsWrapperStyle } from '../../../../../components/ActionBar';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import Url from '../../../../../utils/url';
import { SiteStateContext } from '../../../../../SiteState';

interface FunctionLogOptionsCalloutProps {
  setIsDialogVisible: (isVisible: boolean) => void;
  setSelectedLoggingOption?: (option: LoggingOptions) => void;
}

const FunctionLogOptionsCallout: React.FC<FunctionLogOptionsCalloutProps> = props => {
  const { setIsDialogVisible, setSelectedLoggingOption } = props;

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const siteStateContext = useContext(SiteStateContext);

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const primaryButtonOnClick = () => {
    if (setSelectedLoggingOption) {
      setSelectedLoggingOption(LoggingOptions.fileBased);
      LogService.trackEvent(LogCategories.functionLog, 'fileBased-logging-selected', {
        resourceId: siteStateContext.resourceId,
        sessionId: Url.getParameterByName(null, 'sessionId'),
      });
    }
    onCloseDialog();
  };

  return (
    <Callout
      role="alertdialog"
      gapSpace={0}
      target={`.editor-logging-dropdown`}
      onDismiss={onCloseDialog}
      setInitialFocus={true}
      directionalHint={DirectionalHint.bottomLeftEdge}
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
