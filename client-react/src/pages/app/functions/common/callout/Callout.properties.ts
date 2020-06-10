import { IDropdownOption } from 'office-ui-fabric-react';

export interface NewConnectionCalloutProps {
  resourceId: string;
  appSettingKeys: string[];
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>;
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>;
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
