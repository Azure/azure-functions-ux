import { Icon } from '@fluentui/react/lib/Icon';
import * as React from 'react';
import { style } from 'typestyle';

const gapBetweenIconAndText = 4;

const frameworkIconStyle = style({
  width: '16px',
  height: '16px',
  minWidth: '16px',
  minHeight: '16px',
});

const containerStyle = style({
  display: 'inline-block',
});

const iconGridCellContentStyle = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${gapBetweenIconAndText}px`,
});

export interface IconGridCellProps {
  iconName?: string;
  customIcon?: JSX.Element;
  text?: React.ReactNode;
  style?: React.CSSProperties;
}

export const IconGridCell = React.memo((props: IconGridCellProps) => {
  const { iconName, customIcon, text, style } = props;

  return (
    <div className={containerStyle}>
      <div className={iconGridCellContentStyle}>
        {customIcon ?? <Icon iconName={iconName} className={frameworkIconStyle} style={style} />}
        {text}
      </div>
    </div>
  );
});

IconGridCell.displayName = 'IconGridCell';
