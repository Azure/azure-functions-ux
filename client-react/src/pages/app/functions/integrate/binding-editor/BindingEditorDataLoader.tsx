import React, { useEffect, useState, useContext } from 'react';
import LoadingComponent from '../../../../../components/loading/loading-component';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { BindingConfigMetadata } from '../../../../../models/functions/bindings-config';
import BindingEditor from './BindingEditor';
import { FunctionBinding } from '../../../../../models/functions/function-binding';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { IStartupInfo } from '../../../../../models/portal-models';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';

export interface BindingEditorBladeInputs {
  binding: FunctionBinding;
}

const BindingEditorDataLoader: React.SFC<void> = () => {
  const [serverBindings, setServerBindings] = useState<BindingConfigMetadata[] | null>(null);

  const startupInfo: IStartupInfo<BindingEditorBladeInputs> = useContext(StartupInfoContext);

  useEffect(() => {
    FunctionsService.getBindingConfigMetadata().then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(
          LogCategories.changeAppPlan,
          'getBindingConfigMetadata',
          `Failed to get bindingConfigMetadata: ${r.metadata.error}`
        );
        return;
      }

      setServerBindings(r.data.bindings);
    });
  }, []);

  if (!serverBindings) {
    return <LoadingComponent />;
  }

  return <BindingEditor bindingsConfigMetadata={serverBindings} currentBindingInfo={startupInfo.featureInfo.data.binding} />;
};

export default BindingEditorDataLoader;
