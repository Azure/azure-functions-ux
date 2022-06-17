import { IChoiceGroupOptionStyles, IChoiceGroupStyles, ITextFieldStyles, IToggleStyles } from '@fluentui/react';
import { useContext, useMemo } from 'react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../ThemeContext';

const spacingBetweenElements = '10px';
const maxElementWidth = '750px';
const maxElementWithLabelWidth = '550px';

export const formStyle = style({
  padding: '5px 20px',
});

export const formDescriptionStyle = style({
  maxWidth: '800px',
});

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const environmentSelectorStackStyle = () =>
  style({
    padding: '8px 15px 8px 0px',
  });

export const environmentSelectorLabelStyle = style({
  paddingRight: '10px',
});

export const tableValueComponentStyle = style({
  display: 'inline-flex',
  cursor: 'pointer',
  alignItems: 'center',
  width: '100%',
});

export const tableValueIconStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '15px',
    marginRight: '5px',
    marginTop: '5px',
    color: theme.semanticColors.hyperlinkText,
  });

export const tableValueFormFieldStyle = style({
  marginBottom: '0px !important',
  height: 'fit-content',
});

export const tableValueTextFieldStyle = style({
  width: '100%',
});

const choiceGroupStyles: IChoiceGroupStyles = {
  flexContainer: {
    gap: '12px',
    marginTop: '-10px',
  },
};

const choiceGroupOptionStyles: IChoiceGroupOptionStyles = {
  choiceFieldWrapper: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
  },
  field: {
    marginTop: '0px',
  },
};

const customLabelStyle = style({
  boxSizing: 'border-box',
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '18px',
  maxWidth: '240px !important',
  minWidth: '240px !important',
});

const customLabelStackStyle = style({
  maxWidth: '240px !important',
  minWidth: '240px !important',
});

const descriptionStyle = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '18px',
  marginBottom: spacingBetweenElements,
  maxWidth: maxElementWidth,
});

const formElementStyle = style({
  maxWidth: maxElementWidth,
  padding: '5px 20px',
});

const headerStyle = style({
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  marginBlock: '0',
});

const sectionStyle = style({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '16px',
});

const textBoxStyle = style({
  maxWidth: maxElementWithLabelWidth,
  marginBottom: '-5px',
});

const toggleStyles: Pick<IToggleStyles, 'text'> = {
  text: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
  },
};

export const useStyles = () => {
  const theme = useContext(ThemeContext);

  const textFieldStyles = useMemo<Pick<ITextFieldStyles, 'field' | 'revealButton' | 'root'>>(
    () => ({
      field: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        selectors: {
          '::-ms-reveal': {
            display: 'none',
          },
          '::placeholder': {
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '18px',
          },
        },
        width: '100%',
      },
      revealButton: {
        selectors: {
          ':hover': {
            backgroundColor: theme.semanticColors.buttonBackgroundHovered,
            color: theme.semanticColors.buttonTextHovered,
          },
        },
      },
      root: {
        width: '100%',
      },
    }),
    [theme]
  );

  return {
    choiceGroup: choiceGroupStyles,
    choiceGroupOption: choiceGroupOptionStyles,
    customLabel: customLabelStyle,
    customLabelStack: customLabelStackStyle,
    description: descriptionStyle,
    formElement: formElementStyle,
    header: headerStyle,
    section: sectionStyle,
    textBox: textBoxStyle,
    textField: textFieldStyles,
    toggle: toggleStyles,
  };
};
