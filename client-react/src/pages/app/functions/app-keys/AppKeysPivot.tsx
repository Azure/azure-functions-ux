import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';

interface AppKeysPivotProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshHostKeys: () => void;
  refreshSystemKeys: () => void;
}

const AppKeysPivot: React.FC<AppKeysPivotProps> = props => {
  return <p>It Works</p>;
};

export default AppKeysPivot;
