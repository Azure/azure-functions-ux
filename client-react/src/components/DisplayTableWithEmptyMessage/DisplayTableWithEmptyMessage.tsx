import * as React from 'react';
import { IDetailsListProps, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { style } from 'typestyle';
interface DisplayTableWithEmptyMessageProps {
  emptyMessage?: string;
}
const emptyTableMessageStyle = style({
  textAlign: 'center',
  width: '100%',
});
type Props = DisplayTableWithEmptyMessageProps & IDetailsListProps;
const DisplayTableWithEmptyMessage: React.SFC<Props> = props => {
  const { emptyMessage, ...rest } = props;
  return (
    <>
      <DetailsList {...rest} />
      {props.items.length === 0 && !!emptyMessage && <div className={emptyTableMessageStyle}>{emptyMessage}</div>}
    </>
  );
};

export default DisplayTableWithEmptyMessage;
