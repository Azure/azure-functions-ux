import { Link } from '@fluentui/react';
import i18next from 'i18next';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as InputSvg } from '../../../../../../images/Common/input.svg';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../../portal-communicator';
import { PortalContext } from '../../../../../../PortalContext';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../../ThemeContext';
import { BindingManager } from '../../../../../../utils/BindingManager';
import { BindingFormBuilder } from '../../../common/BindingFormBuilder';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import { getBindingDirection } from '../FunctionIntegrate.utils';
import BindingCard, { createNew, EditableBindingCardProps, editExisting, emptyList } from './BindingCard';
import { listStyle } from './BindingCard.styles';

const InputBindingCard: React.FC<EditableBindingCardProps> = props => {
  const { functionInfo, bindings, readOnly, loadBindingSettings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const inputs = getInputBindings(functionInfo.properties.config.bindings);
  const content = getContent(
    portalCommunicator,
    functionInfo,
    bindings,
    t,
    bindingEditorContext,
    theme,
    inputs,
    readOnly,
    loadBindingSettings
  );

  return <BindingCard title={t('input')} Svg={InputSvg} content={content} {...props} />;
};

const getInputBindings = (bindings: BindingInfo[]): BindingInfo[] => {
  const inputBindings = bindings.filter(binding => {
    return getBindingDirection(binding) === BindingDirection.in;
  });

  return inputBindings ? inputBindings : [];
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  inputBindings: BindingInfo[],
  readOnly: boolean,
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>
): JSX.Element => {
  const inputList = inputBindings.map((inputBinding, i) => {
    return (
      <li key={i.toString()}>
        <InputLink
          bindingEditorContext={bindingEditorContext}
          bindings={bindings}
          functionInfo={functionInfo}
          inputBinding={inputBinding}
          loadBindingSettings={loadBindingSettings}
          portalCommunicator={portalCommunicator}
        />
      </li>
    );
  });

  const completeInputList = inputList.length > 0 ? inputList : emptyList(t('integrateNoInputsDefined'));
  if (!readOnly) {
    completeInputList.push(
      <li key={'newInput'}>
        <Link
          onClick={() => {
            const inputs = bindings.filter(binding => binding.direction === BindingDirection.in);
            Promise.all(inputs.map(binding => loadBindingSettings(binding.id, false))).then(() => {
              createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.in);
            });
          }}>
          {t('integrateAddInput')}
        </Link>
      </li>
    );
  }

  return <ul className={listStyle(theme)}>{completeInputList}</ul>;
};

interface InputLinkProps {
  bindingEditorContext: BindingEditorContextInfo;
  bindings: Binding[];
  functionInfo: ArmObj<FunctionInfo>;
  inputBinding: BindingInfo;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
  portalCommunicator: PortalCommunicator;
}

const InputLink: React.FC<InputLinkProps> = ({
  bindingEditorContext,
  bindings,
  functionInfo,
  inputBinding,
  loadBindingSettings,
  portalCommunicator,
}) => {
  const { t } = useTranslation();

  const bindingId = useMemo(
    () =>
      bindings.find(
        binding => BindingManager.isBindingTypeEqual(binding.type, inputBinding.type) && binding.direction === BindingDirection.in
      )?.id,
    [bindings, inputBinding]
  );

  return bindingId ? (
    <Link
      onClick={() => {
        loadBindingSettings(bindingId, false).then(() => {
          editExisting(portalCommunicator, t, functionInfo, inputBinding, bindingEditorContext, BindingDirection.in);
        });
      }}>
      {`${BindingFormBuilder.getBindingTypeName(inputBinding, bindings)} ${inputBinding.name ? `(${inputBinding.name})` : ''}`}
    </Link>
  ) : (
    <div>-</div>
  );
};

export default InputBindingCard;
