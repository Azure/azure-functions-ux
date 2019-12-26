import React from 'react';
import { useTranslation } from 'react-i18next';
import { pivotItemWrapper, functionTestGroupStyle, responseStatusStyle, responseStyle } from './FunctionTest.styles';
import { Label } from 'office-ui-fabric-react';

export interface FunctionTestOutputProps {
  responseCode: number;
  responseBody: string;
}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();
  const { responseCode, responseBody } = props;

  return (
    <div className={pivotItemWrapper}>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_responseStatus')}</Label>
        <div className={responseStatusStyle}>
          <span>
            {responseCode}
            {/** TODO (krmitta): Add (or not) icon after the discussion with Byron [WI 5536379] */}
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
