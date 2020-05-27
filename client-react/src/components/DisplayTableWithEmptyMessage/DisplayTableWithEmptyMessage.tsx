import { DetailsList, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useContext } from 'react';
import { style } from 'typestyle';

import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { ShimmeredDetailsList } from 'office-ui-fabric-react';
import { detailListHeaderStyle } from '../form-controls/formControl.override.styles';

export interface ShimmerProps {
  lines: number;
  show: boolean;
}
export interface DisplayTableWithEmptyMessageProps {
  emptyMessage?: string;
  shimmer?: ShimmerProps;
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

const initialShimmerTableStyle = (shimmerVisible: boolean) =>
  style({
    overflow: shimmerVisible ? 'hidden' : 'inherit',
  });

export const defaultCellStyle = style({
  fontSize: '12px',
  height: '15px',
});
type Props = DisplayTableWithEmptyMessageProps & IDetailsListProps;
const DisplayTableWithEmptyMessage: React.SFC<Props> = props => {
  const theme = useContext(ThemeContext);
  const { emptyMessage, shimmer, columns, ...rest } = props;

  const updatedColumns = (columns || []).map(column => {
    const allHeaderClassName = `${detailListHeaderStyle} ${column.headerClassName || ''}`;
    column.headerClassName = allHeaderClassName;
    return column;
  });

  return (
    <>
      {shimmer ? (
        <ShimmeredDetailsList
          enableShimmer={shimmer.show}
          shimmerLines={shimmer.lines}
          className={initialShimmerTableStyle(shimmer.show)}
          removeFadingOverlay={true}
          columns={updatedColumns}
          detailsListStyles={rest.styles}
          {...rest}
        />
      ) : (
        <DetailsList columns={updatedColumns} {...rest} />
      )}
      {props.items.length === 0 && !!emptyMessage && (!shimmer || !shimmer.show) && (
        <div className={emptyTableMessageStyle(theme)}>{emptyMessage}</div>
      )}
    </>
  );
};

export default DisplayTableWithEmptyMessage;
