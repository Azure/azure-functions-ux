import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { HandlerMapping } from '../../../../models/WebAppModels';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { formElementStyle } from '../AppSettings.Styles';
import FormActionBar from 'src/components/FormActionBar';
export interface HandlerMappingAddEditProps extends HandlerMapping {
  updateHandlerMapping: (item: HandlerMapping) => any;
  closeBlade: () => void;
}

const HandlerMappingsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateHandlerMapping, children, t, closeBlade, ...handlerMapping } = props;
  const [currentHandlerMapping, setCurrentHandlerMapping] = React.useState(handlerMapping);
  const updateHandlerMappingExtension = (e: any, extension: string) => {
    setCurrentHandlerMapping({ ...currentHandlerMapping, extension });
  };

  const updateHandlerMappingScriptProccessor = (e: any, scriptProcessor: string) => {
    setCurrentHandlerMapping({ ...currentHandlerMapping, scriptProcessor });
  };

  const updateHandlerMappingArguments = (e: any, argumentsVal: string) => {
    setCurrentHandlerMapping({
      ...currentHandlerMapping,
      arguments: argumentsVal,
    });
  };

  const save = () => {
    updateHandlerMapping(currentHandlerMapping);
  };

  const cancel = () => {
    closeBlade();
  };
  return (
    <form>
      <TextField
        label={t('extension')}
        id="handler-mappings-table-extension"
        value={currentHandlerMapping.extension}
        onChange={updateHandlerMappingExtension}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('scriptProcessor')}
        id="handler-mappings-table-script-processor"
        value={currentHandlerMapping.scriptProcessor}
        onChange={updateHandlerMappingScriptProccessor}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('argumentsRes')}
        id="handler-mappings-table-arguments"
        value={currentHandlerMapping.arguments}
        onChange={updateHandlerMappingArguments}
        styles={{
          root: formElementStyle,
        }}
      />
      <FormActionBar save={save} cancel={cancel} valid={true} />
    </form>
  );
};
export default translate('translation')(HandlerMappingsAddEdit);
