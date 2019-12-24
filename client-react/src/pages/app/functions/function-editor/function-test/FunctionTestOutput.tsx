import React from 'react';
import { useTranslation } from 'react-i18next';
import { pivotItemWrapper, functionTestGroupStyle, responseStatusStyle, responseStyle, responseStatusIcon } from './FunctionTest.styles';
import { Label, registerIcons, Icon } from 'office-ui-fabric-react';
import { ReactComponent as SuccessIcon } from '../../../../../images/Common/success-icon.svg';
import { ReactComponent as ErrorIcon } from '../../../../../images/Common/error-icon.svg';
import { ReactComponent as WarningIcon } from '../../../../../images/Common/warning-icon.svg';

registerIcons({
  icons: {
    successIcon: <SuccessIcon className={responseStatusIcon} />,
    errorIcon: <ErrorIcon className={responseStatusIcon} />,
    warningIcon: <WarningIcon className={responseStatusIcon} />,
  },
});

export interface FunctionTestOutputProps {
  responseCode: number;
  responseBody: string;
}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();
  const { responseCode, responseBody } = props;

  const getIconName = () => {
    if (!responseCode) {
      return '';
    }
    if (responseCode > 99 && responseCode < 300) {
      return 'successIcon';
    }
    if (responseCode > 299 && responseCode < 400) {
      return 'warningIcon';
    }
    return 'errorIcon';
  };

  return (
    <div className={pivotItemWrapper}>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_responseStatus')}</Label>
        <div className={responseStatusStyle}>
          <span>
            {responseCode}
            <Icon iconName={getIconName()} />
          </span>
        </div>
      </div>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_response')}</Label>
        <div className={responseStyle}>{responseBody}</div>
      </div>
      <div className={functionTestGroupStyle}>
        <Label>{t('functionMonitor_invocationLog')}</Label>
        {/* TODO (allisonm): Add Invocation Log for the Output */}
      </div>
    </div>
  );
};

export default FunctionTestOutput;
