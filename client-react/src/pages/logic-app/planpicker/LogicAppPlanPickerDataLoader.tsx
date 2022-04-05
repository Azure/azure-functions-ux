import React from 'react';
import LogicAppPlanPicker from './LogicAppPlanPicker';
import { LogicAppPlan } from './LogicAppPlanPicker.types';

export interface LogicAppPlanPickerDataLoaderProps {
  currentPlan: LogicAppPlan;
}

const LogicAppPlanPickerDataLoader: React.FC<LogicAppPlanPickerDataLoaderProps & { path: string }> = ({ currentPlan }) => {
  return <LogicAppPlanPicker currentPlan={currentPlan} />;
};

export default LogicAppPlanPickerDataLoader;
