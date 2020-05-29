import React, { useContext } from 'react';
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
import { PortalTheme } from '../../../../../../models/portal-models';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../../../components/monaco-editor/monaco-editor';
import { EditorLanguage } from '../../../../../../utils/EditorManager';
import { StartupInfoContext } from '../../../../../../StartupInfoContext';

export interface FunctionTestOutputProps {
  responseContent?: ResponseContent;
}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();
  const { responseContent } = props;

  const startUpInfoContext = useContext(StartupInfoContext);

  const getBodyValue = () => {
    if (!!responseContent && !!responseContent.text) {
      const text = responseContent.text;
      if (typeof text !== 'string') {
        // third parameter refers to the number of white spaces.
        // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
        return JSON.stringify(text, null, 2);
      } else {
        return text;
      }
    } else {
      return '';
    }
  };

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
        <div className={responseContentStyle}>
          <MonacoEditor
            language={EditorLanguage.json}
            value={getBodyValue()}
            theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
            height="70px"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: true,
              lineNumbers: false,
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              disableLayerHinting: true,
              readOnly: true,
              hideReadOnlyTooltip: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FunctionTestOutput;
