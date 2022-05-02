import { Link } from '@fluentui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Binding } from '../../../../../../models/functions/binding';
import { BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../../portal-communicator';
import { BindingManager } from '../../../../../../utils/BindingManager';
import { BindingFormBuilder } from '../../../common/BindingFormBuilder';
import { BindingEditorContextInfo } from '../FunctionIntegrate';
import { editExisting } from './BindingCard';

interface BindingCardLinkProps {
  bindingDirection: BindingDirection;
  bindingEditorContext: BindingEditorContextInfo;
  bindingInfo: BindingInfo;
  bindings: Binding[];
  functionInfo: ArmObj<FunctionInfo>;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
  portalCommunicator: PortalCommunicator;
}

const BindingCardLink: React.FC<BindingCardLinkProps> = ({
  bindingDirection,
  bindingEditorContext,
  bindings,
  functionInfo,
  bindingInfo,
  loadBindingSettings,
  portalCommunicator,
}: BindingCardLinkProps) => {
  const { t } = useTranslation();

  const bindingId = useMemo(
    () =>
      bindings.find(
        binding =>
          BindingManager.isBindingTypeEqual(binding.type, bindingInfo.type) &&
          (bindingDirection === binding.direction || bindingDirection === BindingDirection.trigger)
      )?.id,
    [bindingDirection, bindings, bindingInfo]
  );

  return bindingId ? (
    <Link
      onClick={() => {
        loadBindingSettings(bindingId, false).then(() => {
          editExisting(portalCommunicator, t, functionInfo, bindingInfo, bindingEditorContext, bindingDirection);
        });
      }}>
      {`${BindingFormBuilder.getBindingTypeName(bindingInfo, bindings)} ${bindingInfo.name ? `(${bindingInfo.name})` : ''}`}
    </Link>
  ) : (
    <div>-</div>
  );
};

export default BindingCardLink;
