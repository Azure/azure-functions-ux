import React from 'react';

interface IArmDeploymentTemplate {
  $schema: string;
  contentVersion: '1.0.0.0'; // This isn't a "recurring setup" type of template, so this can stay constant
  functions: any[];
  outputs: any;
  parameters: any;
  resources: any[];
  variables: any;
}

export interface IArmResourceTemplate {
  name: string;
  apiVersion: string;
  type: string;
  dependsOn?: string[];
  properties?: Record<string, any>;
}

export type TSetArmResourceTemplate = React.Dispatch<React.SetStateAction<IArmResourceTemplate>>;

export type TSetArmResourceTemplates = React.Dispatch<React.SetStateAction<IArmResourceTemplate[]>>;

// Makes ARM deployment to resource group
// https://docs.microsoft.com/en-us/rest/api/resources/deployments/create-or-update
export const getArmDeploymentTemplate = (resources: any[], parameterDefinitions: any = {}, parameters: any = {}) => {
  const template: IArmDeploymentTemplate = {
    $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    functions: [],
    outputs: {},
    parameters: parameterDefinitions,
    resources,
    variables: {},
  };

  return {
    properties: {
      mode: 'Incremental',
      parameters,
      template,
    },
  };
};
