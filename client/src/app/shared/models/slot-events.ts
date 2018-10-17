import { SlotOperationState, SwapOperationType } from './constants';

export interface SlotSwapInfo {
  isMultiPhase: boolean;
  operationType: SwapOperationType;
  srcId: string;
  srcName: string;
  destId: string;
  destName: string;
  state?: SlotOperationState;
  success?: boolean;
}

export interface SlotNewInfo {
  resourceId: string;
  state?: SlotOperationState;
  success?: boolean;
}
