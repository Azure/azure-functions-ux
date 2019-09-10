import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { HandlerMapping } from '../../../../models/site/config';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';

export interface HandlerMappingAddEditProps {
  updateHandlerMapping: (item: HandlerMapping) => any;
  closeBlade: () => void;
  handlerMapping: HandlerMapping;
}

const HandlerMappingsAddEdit: React.SFC<HandlerMappingAddEditProps> = props => {
  const { updateHandlerMapping, closeBlade, handlerMapping } = props;
  const { t } = useTranslation();
  const [extensionError, setExtensionError] = useState('');
  const [scriptProcessorError, setScriptProcessor] = useState('');
  const [currentHandlerMapping, setCurrentHandlerMapping] = useState(handlerMapping);

  const validateHandlerMappingExtension = (value: string) => {
    return !value ? t('handlerMappingPropIsRequired').format('extension') : '';
  };
  const updateHandlerMappingExtension = (e: any, extension: string) => {
    const error = validateHandlerMappingExtension(extension);
    setExtensionError(error);
    setCurrentHandlerMapping({ ...currentHandlerMapping, extension });
  };

  const validateHandlerMappingScriptProccessor = (value: string) => {
    return !value ? t('handlerMappingPropIsRequired').format('scriptProccessor') : '';
  };
  const updateHandlerMappingScriptProccessor = (e: any, scriptProcessor: string) => {
    const error = validateHandlerMappingScriptProccessor(scriptProcessor);
    setScriptProcessor(error);
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

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: save,
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  return (
    <form className={addEditFormStyle}>
      <TextFieldNoFormik
        label={t('extension')}
        widthOverride="100%"
        id="handler-mappings-table-extension"
        value={currentHandlerMapping.extension}
        errorMessage={extensionError}
        onChange={updateHandlerMappingExtension}
        styles={{
          root: formElementStyle,
        }}
        autoFocus
      />
      <TextFieldNoFormik
        label={t('scriptProcessor')}
        widthOverride="100%"
        id="handler-mappings-table-script-processor"
        value={currentHandlerMapping.scriptProcessor}
        errorMessage={scriptProcessorError}
        onChange={updateHandlerMappingScriptProccessor}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextFieldNoFormik
        label={t('argumentsRes')}
        widthOverride="100%"
        id="handler-mappings-table-arguments"
        value={currentHandlerMapping.arguments}
        onChange={updateHandlerMappingArguments}
        styles={{
          root: formElementStyle,
        }}
      />
      <ActionBar
        id="handler-mappings-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </form>
  );
};
export default HandlerMappingsAddEdit;
