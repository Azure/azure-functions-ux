import { IButtonProps, IconButton as OfficeIconButton } from 'office-ui-fabric-react/lib/Button';
import React, { useContext } from 'react';

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
