import React from 'react';
import { IButtonProps, ActionButton } from 'office-ui-fabric-react';
import { tableCommandBarButtonStyle } from './DisplayTableWithCommandBar.style';

const DisplayTableCommandBarButton: React.FC<IButtonProps> = props => {
  return <ActionButton {...props} styles={tableCommandBarButtonStyle} />;
};

export default DisplayTableCommandBarButton;
