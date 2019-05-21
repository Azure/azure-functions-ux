import React from 'react';
import { TooltipHost } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ReactComponent as InfoSvg } from '../../images/Common/info.svg';

export interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const defaultTooltipClass = style({
  height: '10px',
  width: '10px',
  display: 'inline-block',
});

export const InfoTooltip = (props: InfoTooltipProps) => {
  const className = props.className ? props.className : defaultTooltipClass;
  return (
    <>
      <TooltipHost content={props.content} calloutProps={{ gapSpace: 0 }}>
        <span className={className}>
          <InfoSvg />
        </span>
      </TooltipHost>
    </>
  );
};
