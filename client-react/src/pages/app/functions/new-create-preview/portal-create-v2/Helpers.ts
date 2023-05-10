import { FunctionTemplateV2, JobInput } from '../../../../../models/functions/function-template-v2';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { JobType } from './JobType';

export function getJobInputs(selectedTemplate: FunctionTemplateV2, jobType: string) {
  return selectedTemplate.jobs.find(({ type }) => type === jobType)?.inputs;
}

export function getPaths(
  selectedTemplate: FunctionTemplateV2,
  jobType: string,
  substitutions: Record<string, string>
): string[] | undefined {
  switch (jobType) {
    case JobType.CreateNewApp: {
      const path1 = selectedTemplate.actions.find(({ name }) => name === 'readFileContent_FunctionApp')?.filePath;
      return path1 ? applySubstitutionsToPaths([path1], substitutions) : undefined;
    }
    case JobType.AppendToFile: {
      const path1 = selectedTemplate.actions.find(({ name }) => name === 'readFileContent_FunctionBody')?.filePath;
      return path1 ? applySubstitutionsToPaths([path1], substitutions) : undefined;
    }
    case JobType.CreateNewBlueprint: {
      const path1 = selectedTemplate.actions.find(({ name }) => name === 'readFileContent_BlueprintFile')?.filePath;
      const path2 = selectedTemplate.actions.find(({ name }) => name === 'readFileContent_BlueprintBody')?.filePath;
      return path1 && path2 ? applySubstitutionsToPaths([path1, path2], substitutions) : undefined;
    }
    case JobType.AppendToBlueprint: {
      const path1 = selectedTemplate.actions.find(({ name }) => name === 'readFileContent_BlueprintBody')?.filePath;
      return path1 ? applySubstitutionsToPaths([path1], substitutions) : undefined;
    }
    default:
      return undefined;
  }
}

export function getSubstitutions(selectedTemplate: FunctionTemplateV2, jobType: string, values: BindingEditorFormValues) {
  // Modify the file with form values via string interpolation.
  const toSubstitution = (previous: Record<string, string>, current: JobInput): Record<string, string> => {
    return { ...previous, [current.assignTo]: values[current.paramId] };
  };

  return getJobInputs(selectedTemplate, jobType)?.reduce(toSubstitution, {});
}

function applySubstitutionsToPaths(paths: string[], substitutions: Record<string, string>): string[] {
  return paths.map(path => {
    return Object.entries(substitutions).reduce((previous, [key, value]) => {
      return previous.replaceAll(key, value);
    }, path);
  });
}
