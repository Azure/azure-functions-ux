import React, { useContext } from 'react';
import { FunctionBinding } from '../../../../../models/functions/function-binding';
import { Link } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { getCardStyle, getHeaderStyle, listStyle } from './DataFlowDiagram.styles';

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

const DataFlowCard: React.SFC<DataFlowCardProps> = props => {
  const { title, emptyMessage, Svg, functionName, items, supportsMultipleItems } = props;

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <div className={getCardStyle(theme)}>
      <div className={getHeaderStyle(theme)}>
        <h3>{title}</h3>
        <Svg />
      </div>
      {getItemsList(items, emptyMessage, t, functionName, supportsMultipleItems)}
    </div>
  );
};

const getItemsList = (
  items: FunctionBinding[],
  emptyMessage: string,
  t: i18next.TFunction,
  functionName?: string,
  supportsMultipleItems?: boolean
) => {
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
        <Link>{t('integrateAddInput')}</Link>
      </li>
    );
  }

  return <ul className={listStyle}>{list}</ul>;
};

export default DataFlowCard;
