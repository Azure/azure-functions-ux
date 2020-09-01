import React from 'react';
export interface IFunctionCreateContext {
  creatingFunction?: boolean;
}

export const FunctionCreateContext = React.createContext<IFunctionCreateContext>({} as IFunctionCreateContext);
