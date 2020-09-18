import { HttpException } from '@nestjs/common';
import { AppStackOs } from './2020-06-01/models/AppStackModel';
import { FunctionAppStackValue } from './2020-06-01/models/FunctionAppStackModel';
import { WebAppStackValue } from './2020-06-01/models/WebAppStackModel';

export function validateOs(os?: AppStackOs) {
  if (os && os !== 'linux' && os !== 'windows') {
    throw new HttpException(`Incorrect os '${os}' provided. Allowed os values are 'linux' or 'windows'.`, 400);
  }
}

export function validateApiVersion(apiVersion: string, acceptedVersions: string[]) {
  if (!apiVersion) {
    throw new HttpException(`Missing 'api-version' query parameter. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
  }

  if (!acceptedVersions.includes(apiVersion)) {
    throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
  }
}

export function validateFunctionAppStack(stack?: FunctionAppStackValue) {
  const stackValues: FunctionAppStackValue[] = ['dotnetCore', 'dotnetFramework', 'java', 'node', 'powershell', 'python', 'custom'];
  if (stack && !stackValues.includes(stack)) {
    throw new HttpException(`Incorrect function app stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
  }
}

export function validateWebAppStack(stack?: WebAppStackValue) {
  const stackValues: WebAppStackValue[] = ['aspnet', 'dotnetcore', 'java', 'javacontainers', 'node', 'php', 'python', 'ruby'];
  if (stack && !stackValues.includes(stack)) {
    throw new HttpException(`Incorrect web app stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
  }
}

export function validateRemoveHiddenStacks(removeHiddenStacks?: string) {
  if (removeHiddenStacks && removeHiddenStacks.toLowerCase() !== 'true' && removeHiddenStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removeHiddenStacks '${removeHiddenStacks}' provided. Allowed removeHiddenStacks values are 'true' or 'false'.`,
      400
    );
  }
}

export function validateRemoveDeprecatedStacks(removeDeprecatedStacks?: string) {
  if (removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() !== 'true' && removeDeprecatedStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removeDeprecatedStacks '${removeDeprecatedStacks}' provided. Allowed removeDeprecatedStacks values are 'true' or 'false'.`,
      400
    );
  }
}

export function validateRemovePreviewStacks(removePreviewStacks?: string) {
  if (removePreviewStacks && removePreviewStacks.toLowerCase() !== 'true' && removePreviewStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removePreviewStacks '${removePreviewStacks}' provided. Allowed removePreviewStacks values are 'true' or 'false'.`,
      400
    );
  }
}
