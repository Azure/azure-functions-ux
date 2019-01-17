import { IButtonProps, IconButton as OfficeIconButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { connect } from 'react-redux';

import { ITheme } from '@uifabric/styling';

import { RootState } from '../../modules/types';

const IconButton: React.SFC<IButtonProps & { theme: ITheme }> = props => {
  return (
    <OfficeIconButton
      {...props}
      styles={{
        root: {
          color: props.theme.semanticColors.bodyText,
          background: 'none',
        },
      }}
    />
  );
};

const mapStateToProps = (state: RootState) => ({
  theme: state.portalService.theme,
});
export default connect(
  mapStateToProps,
  null
)(IconButton);
