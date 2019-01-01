import { DetailsList, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';
import { connect } from 'react-redux';
import { style } from 'typestyle';

import { RootState } from '../../modules/types';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

interface DisplayTableWithEmptyMessageProps {
  emptyMessage?: string;
  theme: ThemeExtended;
}
const emptyTableMessageStyle = (theme: ThemeExtended) =>
  style({
    textAlign: 'center',
    width: '100%',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.neutralSecondaryAlt}`,
    backgroundColor: theme.semanticColors.listBackground,
  });

type Props = DisplayTableWithEmptyMessageProps & IDetailsListProps;
const DisplayTableWithEmptyMessage: React.SFC<Props> = props => {
  const { emptyMessage, theme, ...rest } = props;
  return (
    <>
      <DetailsList {...rest} />
      {props.items.length === 0 && !!emptyMessage && <div className={emptyTableMessageStyle(theme)}>{emptyMessage}</div>}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    theme: state.portalService.theme,
  };
};
export default connect(
  mapStateToProps,
  null
)(DisplayTableWithEmptyMessage);
