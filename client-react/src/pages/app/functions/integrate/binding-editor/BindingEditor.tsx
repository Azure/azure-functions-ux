import React from 'react';
import { BindingConfigMetadata, BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import { FunctionBinding, BindingDirection } from '../../../../../models/functions/function-binding';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export interface BindingEditorProps {
  bindingsConfigMetadata: BindingConfigMetadata[];
  currentBindingInfo: FunctionBinding;
}

const BindingEditor: React.SFC<BindingEditorProps> = props => {
  const { bindingsConfigMetadata, currentBindingInfo } = props;

  const { t } = useTranslation();

  const selectedBindingMetadata = bindingsConfigMetadata.find(b => b.type === currentBindingInfo.type) as BindingConfigMetadata;

  if (!selectedBindingMetadata) {
    console.log(`Couldn't find current binding`);
    return <div />;
  }

  const bindingConfigs = getBindingConfigs(currentBindingInfo, bindingsConfigMetadata);
  bindingConfigs.forEach(b => {
    console.log(getLocalizedString(b.displayName, t));
  });

  return <h1> {getLocalizedString(selectedBindingMetadata.displayName, t)}</h1>;
};

const getLocalizedString = (s: string, t: i18next.TFunction) => {
  if (s.startsWith('$')) {
    return t(s.substring(1, s.length));
  }

  return t(s);
};

export const getBindingConfigDirection = (bindingInfo: FunctionBinding) => {
  if (bindingInfo.direction === BindingDirection.in) {
    return bindingInfo.type.toLowerCase().indexOf('trigger') > -1 ? BindingConfigDirection.trigger : BindingConfigDirection.in;
  }

  return BindingConfigDirection.out;
};

const getBindingConfigs = (currentBindingInfo: FunctionBinding, bindingConfigsMetadata: BindingConfigMetadata[]) => {
  const direction = getBindingConfigDirection(currentBindingInfo);
  return bindingConfigsMetadata.filter(b => b.direction === direction);
};

export default BindingEditor;
