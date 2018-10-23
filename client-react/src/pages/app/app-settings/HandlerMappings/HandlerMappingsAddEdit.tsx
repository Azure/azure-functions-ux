import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { HandlerMapping } from '../../../../models/WebAppModels';
import { translate, InjectedTranslateProps } from 'react-i18next';
export interface HandlerMappingAddEditProps extends HandlerMapping {
  updateHandlerMapping: (item: HandlerMapping) => any;
}

const HandlerMappingsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateHandlerMapping, children, t, ...handlerMapping } = props;
  const updateHandlerMappingExtension = (extension: string) => {
    updateHandlerMapping({ ...handlerMapping, extension });
  };

  const updateHandlerMappingScriptProccessor = (scriptProcessor: string) => {
    updateHandlerMapping({ ...handlerMapping, scriptProcessor });
  };

  const updateHandlerMappingArguments = (argumentsVal: string) => {
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
        onChanged={updateHandlerMappingExtension}
      />
      <TextField
        label={t('scriptProcessor')}
        id="handler-mappings-table-script-processor"
        value={handlerMapping.scriptProcessor}
        onChanged={updateHandlerMappingScriptProccessor}
      />
      <TextField
        label={t('argumentsRes')}
        id="handler-mappings-table-arguments"
        value={handlerMapping.arguments}
        onChanged={updateHandlerMappingArguments}
      />
    </div>
  );
};
export default translate('translation')(HandlerMappingsAddEdit);
