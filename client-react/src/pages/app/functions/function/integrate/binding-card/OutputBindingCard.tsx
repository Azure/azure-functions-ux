import { Link } from '@fluentui/react';
import i18next from 'i18next';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as OutputSvg } from '../../../../../../images/Common/output.svg';
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

const OutputBindingCard: React.FC<EditableBindingCardProps> = props => {
  const { functionInfo, bindings, readOnly, loadBindingSettings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const outputs = getOutputBindings(functionInfo.properties.config.bindings);
  const content = getContent(
    portalCommunicator,
    functionInfo,
    bindings,
    t,
    bindingEditorContext,
    theme,
    outputs,
    readOnly,
    loadBindingSettings
  );

  return <BindingCard title={t('output')} Svg={OutputSvg} content={content} {...props} />;
};

const getOutputBindings = (bindings: BindingInfo[]): BindingInfo[] => {
  const outputBindings = bindings.filter(binding => {
    return getBindingDirection(binding) === BindingDirection.out;
  });

  return outputBindings ? outputBindings : [];
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  outputBindings: BindingInfo[],
  readOnly: boolean,
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>
): JSX.Element => {
  const outputList: JSX.Element[] = outputBindings.map((outputBinding, i) => {
    return (
      <li key={i.toString()}>
        <OutputLink
          bindingEditorContext={bindingEditorContext}
          bindings={bindings}
          functionInfo={functionInfo}
          loadBindingSettings={loadBindingSettings}
          outputBinding={outputBinding}
          portalCommunicator={portalCommunicator}
        />
      </li>
    );
  });

  const completeOutputList = outputList.length > 0 ? outputList : emptyList(t('integrateNoOutputsDefined'));
  if (!readOnly) {
    completeOutputList.push(
      <li key={'newOutput'}>
        <Link
          onClick={() => {
            const inputs = bindings.filter(binding => binding.direction === BindingDirection.out);
            Promise.all(inputs.map(binding => loadBindingSettings(binding.id, false))).then(() => {
              createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.out);
            });
          }}>
          {t('integrateAddOutput')}
        </Link>
      </li>
    );
  }

  return <ul className={listStyle(theme)}>{completeOutputList}</ul>;
};

interface OutputLinkProps {
  bindingEditorContext: BindingEditorContextInfo;
  bindings: Binding[];
  functionInfo: ArmObj<FunctionInfo>;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
  outputBinding: BindingInfo;
  portalCommunicator: PortalCommunicator;
}

const OutputLink: React.FC<OutputLinkProps> = ({
  bindingEditorContext,
  bindings,
  functionInfo,
  loadBindingSettings,
  outputBinding,
  portalCommunicator,
}) => {
  const { t } = useTranslation();

  const bindingId = useMemo(
    () =>
      bindings.find(
        binding => BindingManager.isBindingTypeEqual(binding.type, outputBinding.type) && binding.direction === BindingDirection.out
      )?.id,
    [bindings, outputBinding]
  );

  return bindingId ? (
    <Link
      onClick={() => {
        loadBindingSettings(bindingId, false).then(() => {
          editExisting(portalCommunicator, t, functionInfo, outputBinding, bindingEditorContext, BindingDirection.out);
        });
      }}>
      {`${BindingFormBuilder.getBindingTypeName(outputBinding, bindings)} ${outputBinding.name ? `(${outputBinding.name})` : ''}`}
    </Link>
  ) : (
    <div>-</div>
  );
};

export default OutputBindingCard;
