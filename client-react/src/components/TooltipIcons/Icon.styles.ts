import { style } from 'typestyle';
import { CommonConstants } from '../../utils/CommonConstants';

const svgIconStyle = { width: '13px', height: '13px' };
const fontIconStyle = { fontSize: '13px' };
export const upsellIconStyle = style(svgIconStyle, { fill: CommonConstants.NonThemeColors.upsell });
export const infoIconStyle = style(fontIconStyle, { cursor: 'default' });
