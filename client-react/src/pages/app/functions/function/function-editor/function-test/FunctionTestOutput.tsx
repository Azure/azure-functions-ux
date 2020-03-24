import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  pivotItemWrapper,
  functionTestGroupStyle,
  responseCodeStyle,
  responseContentStyle,
  testFormLabelStyle,
} from './FunctionTest.styles';
import { Label } from 'office-ui-fabric-react';
import { ResponseContent } from '../FunctionEditor.types';
import { HttpConstants } from '../../../../../../utils/constants/HttpConstants';

export interface FunctionTestOutputProps {
  responseContent?: ResponseContent;
}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();
  const { responseContent } = props;

  return (
    <div className={pivotItemWrapper}>
      <div className={functionTestGroupStyle}>
        <Label className={testFormLabelStyle}>{t('httpRun_responseCode')}</Label>
        <div className={responseCodeStyle}>
          {!!responseContent ? `${responseContent.code} ${HttpConstants.statusCodeToText(responseContent.code)}` : ''}
        </div>
      </div>
      <div className={functionTestGroupStyle}>
        <Label className={testFormLabelStyle}>{t('httpRun_responseContent')}</Label>
        <div className={responseContentStyle}>{!!responseContent && !!responseContent.text ? responseContent.text : ''}</div>
      </div>
    </div>
  );
};

export default FunctionTestOutput;
