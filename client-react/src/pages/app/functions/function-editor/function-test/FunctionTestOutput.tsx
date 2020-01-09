import React from 'react';
import { useTranslation } from 'react-i18next';
import { pivotItemWrapper, functionTestGroupStyle, responseStatusStyle, responseStyle } from './FunctionTest.styles';
import { Label } from 'office-ui-fabric-react';
import { ResponseContent } from '../FunctionEditor.types';

export interface FunctionTestOutputProps {
  responseContent: ResponseContent | undefined;
}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();
  const { responseContent } = props;

  return (
    <div className={pivotItemWrapper}>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_responseStatus')}</Label>
        <div className={responseStatusStyle}>
          <span>{!!responseContent && responseContent.code}</span>
        </div>
      </div>
      <div className={functionTestGroupStyle}>
        <Label>{t('httpRun_response')}</Label>
        <div className={responseStyle}>{!!responseContent && !!responseContent.text ? responseContent.text : ''}</div>
      </div>
      <div className={functionTestGroupStyle}>
        <Label>{t('functionMonitor_invocationLog')}</Label>
        {/* TODO (krmitta): Add Invocation Log for the Output */}
      </div>
    </div>
  );
};

export default FunctionTestOutput;
