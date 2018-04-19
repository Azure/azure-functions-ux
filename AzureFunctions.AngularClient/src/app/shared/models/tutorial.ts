import { FunctionInfo } from './function-info';


export interface TutorialEvent {
    functionInfo: FunctionInfo;
    step: TutorialStep;
};

export enum TutorialStep {
    Off = -1,
    Waiting,
    Develop,
    Integrate,
    AppSettings,
    NextSteps
}