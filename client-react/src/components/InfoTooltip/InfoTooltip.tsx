import React, { useRef } from 'react';
import { TooltipHost, getId } from 'office-ui-fabric-react';
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
  const hostId = useRef<string>(getId('tooltipHost'));
  const className = props.className ? props.className : defaultTooltipClass;
  return (
    <>
      <TooltipHost content={props.content} id={hostId.current} calloutProps={{ gapSpace: 0 }}>
        <span className={className}>
          <InfoSvg aria-labelledby={hostId.current} />
        </span>
      </TooltipHost>
    </>
  );
};
