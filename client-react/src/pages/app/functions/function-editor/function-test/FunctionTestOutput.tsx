import React from 'react';
import { useTranslation } from 'react-i18next';
import { pivotItemWrapper, functionTestGroupStyle, responseStatusStyle, responseStyle, responseStatusIcon } from './FunctionTest.styles';
import { Label, registerIcons, Icon } from 'office-ui-fabric-react';
import { ReactComponent as SuccessCircle } from '../../../../../images/Common/success-circle.svg';
import { ReactComponent as ErrorCircle } from '../../../../../images/Common/error-circle.svg';
import { ReactComponent as WarningTriangle } from '../../../../../images/Common/warning-triangle.svg';

registerIcons({
  icons: {
    successCircle: <SuccessCircle className={responseStatusIcon} />,
    errorCircle: <ErrorCircle className={responseStatusIcon} />,
    warningTriangle: <WarningTriangle className={responseStatusIcon} />,
  },
});

export interface FunctionTestOutputProps {
  responseCode?: number;
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
      return 'successCircle';
    }
    if (responseCode > 299 && responseCode < 400) {
      return 'warningTriangle';
    }
    return 'errorCircle';
  };

  return (
    <div className={pivotItemWrapper}>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_responseStatus')}</Label>
        <div className={responseStatusStyle}>
          {responseCode ? (
            <span>
              {responseCode}
              <Icon iconName={getIconName()} />
            </span>
          ) : (
            ''
          )}
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
