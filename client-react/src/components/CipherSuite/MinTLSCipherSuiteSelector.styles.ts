import { FontWeights, mergeStyleSets } from '@fluentui/style-utilities';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const cipherSuiteStyle = mergeStyleSets({
  dropdownHeader: {
    fontWeight: FontWeights.bold,
  },

  levelsDescription: {
    fontSize: '12px',
  },

  verticalFlexBox: {
    display: 'flex',
    flexFlow: 'column',
    gap: '10px',
  },

  verticalFlexBoxMedGap: {
    display: 'flex',
    flexFlow: 'column',
    gap: '15px',
  },

  icon: {
    width: '16px',
    height: '16px',
    marginTop: '-3px',
    verticalAlign: 'middle',
    marginRight: '11px',
    fontWeight: 'bold',
  },
});

export const selectedIconStyle = (theme: ThemeExtended, selected: boolean) =>
  style({
    width: '16px',
    height: '16px',
    verticalAlign: 'middle',
    marginRight: '11px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: selected ? theme.palette.green : theme.palette.red,
  });

export const cipherSuiteSelectorStyle = (disabled: boolean) =>
  style({
    color: disabled ? 'gray' : 'black',
  });
