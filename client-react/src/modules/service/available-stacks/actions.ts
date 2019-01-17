import { createStandardAction } from 'typesafe-actions';

import { AvailableStack } from '../../../models/available-stacks';
import { ArmArray } from '../../../models/WebAppModels';
import { STACKS_FETCH_FAILURE, STACKS_FETCH_REQUEST, STACKS_FETCH_SUCCESS } from './actionTypes';

export type StacksOS = 'Windows' | 'Linux';

export const fetchStacksRequest = createStandardAction(STACKS_FETCH_REQUEST).map((stackOs: StacksOS) => ({ stackOs }));
export const fetchStacksSuccess = createStandardAction(STACKS_FETCH_SUCCESS).map((stacks: ArmArray<AvailableStack>) => ({
  stacks,
}));
export const fetchStacksFailure = createStandardAction(STACKS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));
