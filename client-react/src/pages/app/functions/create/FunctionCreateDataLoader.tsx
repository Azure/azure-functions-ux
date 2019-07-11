import React, { useState, useEffect } from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';

export interface FunctionCreateDataLoaderProps {
  templateInfo: FunctionTemplate;
}

const FunctionCreateDataLoader: React.SFC<FunctionCreateDataLoaderProps> = props => {
  // const { templateInfo } = props;
  const [templatesMetadata, setTemplatesMetadata] = useState<FunctionTemplate[] | null>(null);
  // const { t } = useTranslation();

  useEffect(() => {
    FunctionsService.getTemplatesMetadata().then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getTemplatesMetadata',
          `Failed to get functionTemplatesMetadata: ${r.metadata.error}`
        );
        return;
      }

      setTemplatesMetadata(r.data);
    });
  }, []);

  if (!templatesMetadata) {
    return <LoadingComponent />;
  }

  return <h1>Hello function create!</h1>;
};
export default FunctionCreateDataLoader;
