import i18next from 'i18next';
import { PanelType } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomPanel from '../../../../../../components/CustomPanel/CustomPanel';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import BindingCreator from './BindingCreator';
import BindingEditor from './BindingEditor';

export interface BindingPanelProps {
  functionAppId: string;
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
  bindingInfo?: BindingInfo;
  bindingDirection: BindingDirection;
  isOpen: boolean;
  onlyBuiltInBindings: boolean;
  readOnly: boolean;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
  onDelete: (currentBindingInfo: BindingInfo) => void;
}

export interface DeleteDialog {
  header: string;
  content: string;
}

const BindingPanel: React.SFC<BindingPanelProps> = props => {
  const {
    functionAppId,
    functionInfo,
    bindings,
    bindingInfo,
    bindingDirection,
    isOpen,
    onlyBuiltInBindings,
    readOnly,
    onPanelClose,
    onSubmit,
    onDelete,
  } = props;
  const { t } = useTranslation();

  return (
    <CustomPanel
      isOpen={isOpen}
      type={PanelType.smallFixedFar}
      headerText={getPanelHeader(t, bindingDirection, bindingInfo)}
      onDismiss={onPanelClose}>
      <div style={{ marginTop: '10px' }}>
        {isOpen &&
          (!bindingInfo ? (
            <BindingCreator
              bindings={bindings}
              functionAppId={functionAppId}
              bindingDirection={bindingDirection}
              readOnly={readOnly}
              onlyBuiltInBindings={onlyBuiltInBindings}
              onPanelClose={onPanelClose}
              onSubmit={onSubmit}
            />
          ) : (
            <BindingEditor
              functionInfo={functionInfo}
              allBindings={bindings}
              currentBindingInfo={bindingInfo}
              functionAppId={functionAppId}
              readOnly={readOnly}
              onSubmit={onSubmit}
              onDelete={onDelete}
              deleteDialogDetails={getDeleteDialogDetails(t, bindingDirection)}
            />
          ))}
      </div>
    </CustomPanel>
  );
};

// If binding info is undefined that means you are creating a new binding info, otherwise you are editing
const getPanelHeader = (t: i18next.TFunction, bindingDirection: BindingDirection, bindingInfo?: BindingInfo) => {
  if (!bindingInfo) {
    switch (bindingDirection) {
      case BindingDirection.in: {
        return t('integrateCreateInput');
      }
      case BindingDirection.out: {
        return t('integrateCreateOutput');
      }
      default: {
        return t('integrateCreateTrigger');
      }
    }
  }

  switch (bindingDirection) {
    case BindingDirection.in: {
      return t('editBindingInput');
    }
    case BindingDirection.out: {
      return t('editBindingOutput');
    }
    default: {
      return t('editBindingTrigger');
    }
  }
};

const getDeleteDialogDetails = (t: i18next.TFunction, bindingDirection: BindingDirection): DeleteDialog => {
  switch (bindingDirection) {
    case BindingDirection.in: {
      return { header: t('integrateDeleteInputConfirmHeader'), content: t('integrateDeleteInputConfirmMessage') };
    }
    case BindingDirection.out: {
      return { header: t('integrateDeleteOutputConfirmHeader'), content: t('integrateDeleteOutputConfirmMessage') };
    }
    default: {
      return { header: t('integrateDeleteTriggerConfirmHeader'), content: t('integrateDeleteTriggerConfirmMessage') };
    }
  }
};

export default BindingPanel;
