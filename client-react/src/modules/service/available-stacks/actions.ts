import { IAction } from '../../../models/action';
import { ArmArray } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';

export const UPDATE_AVAILABLE_STACKS = 'UPDATE_AVAILABLE_STACKS';
export const updateAvailableStacks = (stacks: ArmArray<AvailableStack>): IAction<ArmArray<AvailableStack>> => ({
  payload: stacks,
  type: UPDATE_AVAILABLE_STACKS,
});

export const UPDATE_AVAILABLE_STACKS_LOADING = 'UPDATE_AVAILABLE_STACKS_LOADING';
export const updateStacksLoading = (loading: boolean): IAction<boolean> => ({
  payload: loading,
  type: UPDATE_AVAILABLE_STACKS_LOADING,
});
