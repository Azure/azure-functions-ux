import { DetailsList, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useContext } from 'react';
import { style } from 'typestyle';

import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';

interface DisplayTableWithEmptyMessageProps {
  emptyMessage?: string;
}
const emptyTableMessageStyle = (theme: ThemeExtended) =>
  style({
    textAlign: 'center',
    width: '100%',
    fontSize: '12px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.neutralSecondaryAlt}`,
    backgroundColor: theme.semanticColors.listBackground,
  });

export const defaultCellStyle = style({
  fontSize: '12px',
  height: '15px',
});
type Props = DisplayTableWithEmptyMessageProps & IDetailsListProps;
const DisplayTableWithEmptyMessage: React.SFC<Props> = props => {
  const theme = useContext(ThemeContext);
  const { emptyMessage, ...rest } = props;
  return (
    <>
      <DetailsList {...rest} />
      {props.items.length === 0 && !!emptyMessage && <div className={emptyTableMessageStyle(theme)}>{emptyMessage}</div>}
    </>
  );
};

export default DisplayTableWithEmptyMessage;
