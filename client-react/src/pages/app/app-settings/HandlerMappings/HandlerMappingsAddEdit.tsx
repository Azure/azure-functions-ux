import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { HandlerMapping } from '../../../../models/WebAppModels';
export interface HandlerMappingAddEditProps extends HandlerMapping {
  updateHandlerMapping: (item: HandlerMapping) => any;
}

const HandlerMappingsAddEdit: React.SFC<HandlerMappingAddEditProps> = props => {
  const { updateHandlerMapping, children, ...handlerMapping } = props;
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
      <TextField label="Extension" id="extension" value={handlerMapping.extension} onChanged={updateHandlerMappingExtension} />
      <TextField
        label="Script Processor"
        id="value"
        value={handlerMapping.scriptProcessor}
        onChanged={updateHandlerMappingScriptProccessor}
      />
      <TextField label="Arguments" id="type" value={handlerMapping.arguments} onChanged={updateHandlerMappingArguments} />
    </div>
  );
};
export default HandlerMappingsAddEdit;
