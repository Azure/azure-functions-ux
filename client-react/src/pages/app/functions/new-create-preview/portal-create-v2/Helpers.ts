import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';

export function getAppendToFileInputs(selectedTemplate: FunctionTemplateV2) {
  return getJobInputs(selectedTemplate, 'AppendToFile');
}

export function getCreateNewAppInputs(selectedTemplate: FunctionTemplateV2) {
  return getJobInputs(selectedTemplate, 'CreateNewApp');
}

function getJobInputs(selectedTemplate: FunctionTemplateV2, jobType: string) {
  return selectedTemplate.jobs.find(({ type }) => type === jobType)?.inputs;
}
