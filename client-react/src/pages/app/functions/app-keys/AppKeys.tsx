import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';

export interface AppKeysProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshHostKeys: () => void;
  refreshSystemKeys: () => void;
}

const AppKeys: React.FC<AppKeysProps> = props => {
  return <p>It Works!!</p>;
};

export default AppKeys;
