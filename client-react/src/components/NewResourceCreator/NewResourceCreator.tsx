import { ITextFieldProps } from '@fluentui/react';
import React from 'react';
import TextFieldNoFormik from '../form-controls/TextFieldNoFormik';

export interface INewResourceCreatorProps {
  textFieldProps: ITextFieldProps[];
}

const NewResourceCreator: React.FC<INewResourceCreatorProps> = props => {
  const { textFieldProps } = props;

  const getTextFieldComponent = (fieldProps: ITextFieldProps) => {
    return <TextFieldNoFormik label={fieldProps.label} id={fieldProps.id || ''} />;
  };

  return <>{textFieldProps.map(textFieldProp => getTextFieldComponent(textFieldProp))}</>;
};

export default NewResourceCreator;
