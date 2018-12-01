import * as React from 'react';
import { IDetailsListProps, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { style } from 'typestyle';
import IState from 'src/modules/types';
import { connect } from 'react-redux';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';
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

const mapStateToProps = (state: IState) => {
  return {
    theme: state.portalService.theme,
  };
};
export default connect(
  mapStateToProps,
  null
)(DisplayTableWithEmptyMessage);
