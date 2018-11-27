import { IAction } from '../../models/action';
import { IPlanState } from './reducer';

export const UPDATE_PLAN = 'UPDATE_PLAN';
export const updateCurrentPlan = (state: Partial<IPlanState>): IAction<Partial<IPlanState>> => ({
  payload: state,
  type: UPDATE_PLAN,
});

export const UPDATE_PLAN_NO_CACHE = 'UPDATE_PLAN_NO_CACHE';
export const updateCurrentPlanNoCache = (state: Partial<IPlanState>): IAction<Partial<IPlanState>> => ({
  payload: state,
  type: UPDATE_PLAN_NO_CACHE,
});
