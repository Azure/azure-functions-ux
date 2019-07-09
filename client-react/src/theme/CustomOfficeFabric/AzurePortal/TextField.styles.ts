import { ITextFieldStyleProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import * as StyleConstants from './Constants';
import { ThemeExtended } from '../../SemanticColorsExtended';

export const TextFieldStyles = (props: ITextFieldStyleProps): Partial<ITextFieldStyles> => {
  const { focused, disabled, hasErrorMessage, multiline, theme } = props;
  const { semanticColors, fonts } = theme as ThemeExtended;
  return {
    fieldGroup: [
      !multiline && {
        height: StyleConstants.inputControlHeight,
      },
      focused && {
        borderColor: semanticColors.focusBorder,
      },
      disabled && {
        borderColor: semanticColors.disabledBodyText,
      },
      hasErrorMessage && [
        {
          borderWidth: StyleConstants.borderWidthError,
        },
        focused && {
          borderColor: semanticColors.focusBorder,
          selectors: {
            '&:focus, &:hover': {
              borderColor: semanticColors.focusBorder,
            },
          },
        },
      ],
    ],
    icon: {
      bottom: 2,
    },
    prefix: {
      ...fonts.small,
    },
    suffix: {
      ...fonts.small,
    },
    field: [
      {
        ...fonts.small,
        color: semanticColors.inputText,
        backgroundColor: semanticColors.inputBackground,
        selectors: {
          '::placeholder': {
            color: semanticColors.inputPlaceholderText,
            fontStyle: 'italic',
          },
          ':-ms-input-placeholder': {
            color: semanticColors.inputPlaceholderText,
            fontStyle: 'italic',
          },
          '::-webkit-input-placeholder': {
            color: semanticColors.inputPlaceholderText,
            fontStyle: 'italic',
          },
        },
        marginBottom: '1px',
        marginTop: '1px',
      },
      disabled && {
        color: semanticColors.disabledBodyText,
        backgroundColor: semanticColors.disabledBackground,
      },
    ],
    errorMessage: {
      color: semanticColors.errorText,
    },
  };
};
