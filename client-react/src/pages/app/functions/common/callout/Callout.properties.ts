export interface NewConnectionCalloutProps {
  resourceId: string;
  setNewAppSetting: (a: { key: string; value: string }) => void;
  setSelectedItem: (u: undefined) => void;
  setIsDialogVisible: (b: boolean) => void;
}
