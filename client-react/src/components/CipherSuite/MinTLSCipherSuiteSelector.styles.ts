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
    paddingBottom: '45px',
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

export const cipherSuiteSelectorStyle = (theme: ThemeExtended, disabled: boolean) =>
  style({
    color: disabled ? theme.semanticColors.disabledBodyText : theme.semanticColors.bodyText,
  });
