import { Link } from '@fluentui/react';
import { TFunction } from 'i18next';
import React, { useContext } from 'react';
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
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import { getBindingDirection } from '../FunctionIntegrate.utils';
import BindingCard, { createNew, EditableBindingCardProps, emptyList } from './BindingCard';
import { listStyle } from './BindingCard.styles';
import BindingCardLink from './BindingCardLink';

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
  t: TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  inputBindings: BindingInfo[],
  readOnly: boolean,
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>
): JSX.Element => {
  const inputList = inputBindings.map((inputBinding, i) => {
    return (
      <li key={i.toString()}>
        <BindingCardLink
          bindingDirection={BindingDirection.in}
          bindingEditorContext={bindingEditorContext}
          bindingInfo={inputBinding}
          bindings={bindings}
          functionInfo={functionInfo}
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

export default InputBindingCard;
