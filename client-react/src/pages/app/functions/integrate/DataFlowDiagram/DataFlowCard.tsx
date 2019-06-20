import React, { useContext } from 'react';
import { FunctionBinding } from '../../../../../models/functions/function-binding';
import { style } from 'typestyle';
import { color } from 'csx';
import { Link } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

export interface DataFlowCardChildProps {
  items: FunctionBinding[];
  functionName?: string;
}

export interface DataFlowCardProps extends DataFlowCardChildProps {
  title: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  emptyMessage: string;
  supportsMultipleItems?: boolean;
}

export interface DataFlowCardState {
  items: FunctionBinding[];
}

const getCardStyle = (theme: ThemeExtended) => {
  return style({
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    minWidth: '250px',
    maxWidth: '350px',
    minHeight: '70px',
    paddingTop: '1px',
  });
};

const getHeaderStyle = (theme: ThemeExtended) => {
  return style({
    height: '35px',
    backgroundColor: '#fafafa',
    borderBottom: `solid 1px ${color(theme.semanticColors.cardBorderColor).lighten('20%')}`,

    // Necessary for some reason to prevent overlap with right border on middle card
    marginRight: '1px',

    $nest: {
      h3: {
        marginTop: '0px',
        paddingTop: '5px',
        paddingLeft: '15px',
        fontWeight: '600',
        display: 'inline-block',
      },
      svg: {
        height: '20px',
        width: '20px',
        marginRight: '7px',
        marginTop: '7px',
        float: 'right',
      },
    },
  } as any);
};

const listStyle = style({
  listStyleType: 'none',
  padding: '0px',
  margin: '0px',

  $nest: {
    li: {
      padding: '7px 18px',
    },
    '.emptyMessage': {
      color: '#7f7f7f',
    },
  },
});

const DataFlowCard: React.SFC<DataFlowCardProps> = props => {
  const { title, emptyMessage, Svg, functionName, items, supportsMultipleItems } = props;

  const theme = useContext(ThemeContext);

  return (
    <div className={getCardStyle(theme)}>
      <div className={getHeaderStyle(theme)}>
        <h3>{title}</h3>
        <Svg />
      </div>
      {getItemsList(items, emptyMessage, functionName, supportsMultipleItems)}
    </div>
  );
};

const getItemsList = (items: FunctionBinding[], emptyMessage: string, functionName?: string, supportsMultipleItems?: boolean) => {
  let list: JSX.Element[] = [];

  if (functionName) {
    list.push(
      <li key={'0'}>
        <Link>{functionName}</Link>
      </li>
    );
  } else if (items.length === 0) {
    list.push(
      <li key={'0'} className="emptyMessage">
        {emptyMessage}
      </li>
    );
  } else {
    list = items.map((item, i) => {
      const name = item.name ? `(${item.name})` : '';
      const linkName = `${item.type} ${name}`;
      return (
        <li key={i.toString()}>
          <Link>{linkName}</Link>
        </li>
      );
    });
  }

  if (supportsMultipleItems) {
    list.push(
      <li key={list.length}>
        <Link>+ Add input</Link>
      </li>
    );
  }

  return <ul className={listStyle}>{list}</ul>;
};

export default DataFlowCard;
