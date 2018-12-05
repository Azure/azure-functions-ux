import * as React from 'react';
import { IconButton as OfficeIconButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { ITheme } from '@uifabric/styling';
import IState from '../../modules/types';
import { connect } from 'react-redux';

const IconButton: React.SFC<IButtonProps & { theme: ITheme }> = props => {
  return (
    <OfficeIconButton
      {...props}
      styles={{
        root: {
          color: props.theme.semanticColors.bodyText,
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
        },
      }}
    />
  );
};

const mapStateToProps = (state: IState) => ({
  theme: state.portalService.theme,
});
export default connect(
  mapStateToProps,
  null
)(IconButton);
