import { Link } from '@fluentui/react';
import i18next from 'i18next';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PowerSvg } from '../../../../../../images/Common/power.svg';
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

const TriggerBindingCard: React.FC<EditableBindingCardProps> = props => {
  const { functionInfo, bindings, readOnly, loadBindingSettings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const trigger = getTrigger(functionInfo.properties.config.bindings);
  const content = getContent(
    portalCommunicator,
    functionInfo,
    bindings,
    t,
    bindingEditorContext,
    theme,
    trigger,
    readOnly,
    loadBindingSettings
  );

  return <BindingCard title={t('trigger')} Svg={PowerSvg} content={content} {...props} />;
};

const getTrigger = (bindingsInfo: BindingInfo[]): BindingInfo | undefined => {
  return bindingsInfo.find(binding => {
    return getBindingDirection(binding) === BindingDirection.trigger;
  });
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  trigger: BindingInfo | undefined,
  readOnly: boolean,
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>
): JSX.Element => {
  return (
    <ul className={listStyle(theme)}>
      {trigger ? (
        <li key="0">
          <TriggerLink
            bindingEditorContext={bindingEditorContext}
            bindings={bindings}
            functionInfo={functionInfo}
            loadBindingSettings={loadBindingSettings}
            portalCommunicator={portalCommunicator}
            trigger={trigger}
          />
        </li>
      ) : !readOnly ? (
        <li key={'newTrigger'}>
          <Link
            onClick={() => {
              const triggerBindings = bindings.filter(binding => binding.direction === BindingDirection.trigger);
              Promise.all(triggerBindings.map(binding => loadBindingSettings(binding.id, false))).then(() => {
                createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.trigger);
              });
            }}>
            {t('integrateAddTrigger')}
          </Link>
        </li>
      ) : (
        emptyList(t('integrateNoTriggerDefined'))
      )}
    </ul>
  );
};

interface TriggerLinkProps {
  bindingEditorContext: BindingEditorContextInfo;
  bindings: Binding[];
  functionInfo: ArmObj<FunctionInfo>;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
  portalCommunicator: PortalCommunicator;
  trigger: BindingInfo;
}

const TriggerLink: React.FC<TriggerLinkProps> = ({
  bindingEditorContext,
  bindings,
  functionInfo,
  loadBindingSettings,
  portalCommunicator,
  trigger,
}) => {
  const { t } = useTranslation();

  const bindingId = useMemo(() => bindings.find(binding => BindingManager.isBindingTypeEqual(binding.type, trigger.type))?.id, [
    bindings,
    trigger,
  ]);

  return bindingId ? (
    <Link
      onClick={() => {
        loadBindingSettings(bindingId, false).then(() => {
          editExisting(portalCommunicator, t, functionInfo, trigger, bindingEditorContext, BindingDirection.trigger);
        });
      }}>
      {`${BindingFormBuilder.getBindingTypeName(trigger, bindings)} (${trigger.name})`}
    </Link>
  ) : (
    <div>-</div>
  );
};

export default TriggerBindingCard;
