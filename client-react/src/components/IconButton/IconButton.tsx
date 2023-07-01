import React, { useContext } from 'react';

import { IButtonProps, IconButton as OfficeIconButton } from '@fluentui/react';

import { ThemeContext } from '../../ThemeContext';

const IconButton: React.SFC<IButtonProps> = props => {
  const theme = useContext(ThemeContext);
  return (
    <OfficeIconButton
      {...props}
      styles={{
        root: {
          color: theme.semanticColors.bodyText,
          background: 'none',
        },
      }}
    />
  );
};

export default IconButton;
