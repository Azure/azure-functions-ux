import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { HandlerMapping } from '../../../../models/WebAppModels';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { formElementStyle } from '../AppSettings.Styles';
export interface HandlerMappingAddEditProps extends HandlerMapping {
  updateHandlerMapping: (item: HandlerMapping) => any;
}

const HandlerMappingsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateHandlerMapping, children, t, ...handlerMapping } = props;
  const updateHandlerMappingExtension = (e: any, extension: string) => {
    updateHandlerMapping({ ...handlerMapping, extension });
  };

  const updateHandlerMappingScriptProccessor = (e: any, scriptProcessor: string) => {
    updateHandlerMapping({ ...handlerMapping, scriptProcessor });
  };

  const updateHandlerMappingArguments = (e: any, argumentsVal: string) => {
    updateHandlerMapping({
      ...handlerMapping,
      arguments: argumentsVal,
    });
  };
  return (
    <div>
      <TextField
        label={t('extension')}
        id="handler-mappings-table-extension"
        value={handlerMapping.extension}
        onChange={updateHandlerMappingExtension}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('scriptProcessor')}
        id="handler-mappings-table-script-processor"
        value={handlerMapping.scriptProcessor}
        onChange={updateHandlerMappingScriptProccessor}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('argumentsRes')}
        id="handler-mappings-table-arguments"
        value={handlerMapping.arguments}
        onChange={updateHandlerMappingArguments}
        styles={{
          root: formElementStyle,
        }}
      />
    </div>
  );
};
export default translate('translation')(HandlerMappingsAddEdit);
