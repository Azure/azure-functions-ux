import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { SVGAttributes } from 'react';

export const defaultArrowStyle = (theme: ThemeExtended) => {
  return style({
    stroke: theme.semanticColors.cardBorderColor,
    width: '100%',
  });
};

export const diagramWrapperStyle = style({
  padding: '20px',
  maxWidth: '1200px',
  minWidth: '800px',
});

export const doubleArrowStyle = style({
  height: '115px',
  marginTop: '37px',
});

export const singleArrowStyle = style({
  height: '13px',
  marginTop: '90px',
});

export const singleCardStackStyle = style({
  marginTop: '58px',
});

export const arrowProps: SVGAttributes<SVGSVGElement> = {
  opacity: '1',
  fillOpacity: '0',
  strokeWidth: '1',
  strokeOpacity: '1',
};

export const smallPageStyle = style({
  padding: '20px',
});
