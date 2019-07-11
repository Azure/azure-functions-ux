import React from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';

export interface FunctionCreateProps {
  functionTemplates: FunctionTemplate[];
}

export const FunctionCreate: React.SFC<FunctionCreateProps> = props => {
  return <h1>Hello function create!</h1>;
};
