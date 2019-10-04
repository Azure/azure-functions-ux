import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';

export function onTemplateSelected(functionTemplate: FunctionTemplate, setSelectedFunctionTemplate: any, setPivotStateKey: any) {
  setSelectedFunctionTemplate(functionTemplate);
  setPivotStateKey(PivotState.details);
}
