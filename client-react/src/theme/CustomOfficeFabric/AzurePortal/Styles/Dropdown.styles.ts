// tslint:disable:prefer-template
import { IDropdownStyleProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { IRawStyle, HighContrastSelector, getGlobalClassNames, IStyle, normalize, FontWeights, FontSizes } from '@uifabric/styling';
import { IStyleFunction } from '@uifabric/utilities';
import { ThemeExtended, AzurePortalColors } from '../../../../theme/SemanticColorsExtended';

const GlobalClassNames = {
  root: 'ms-Dropdown-container',
  label: 'ms-Dropdown-label',
  dropdown: 'ms-Dropdown',
  title: 'ms-Dropdown-title',
  caretDownWrapper: 'ms-Dropdown-caretDownWrapper',
  caretDown: 'ms-Dropdown-caretDown',
  callout: 'ms-Dropdown-callout',
  panel: 'ms-Dropdown-panel',
  dropdownItems: 'ms-Dropdown-items',
  dropdownItem: 'ms-Dropdown-item',
  dropdownDivider: 'ms-Dropdown-divider',
  dropdownOptionText: 'ms-Dropdown-optionText',
  dropdownItemHeader: 'ms-Dropdown-header',
  titleIsPlaceHolder: 'ms-Dropdown-titleIsPlaceHolder',
  titleHasError: 'ms-Dropdown-title--hasError',
};

const DROPDOWN_HEIGHT = 23;
const DROPDOWN_ITEMHEIGHT = 23;

const highContrastAdjustMixin = {
  // highContrastAdjust mixin
  '@media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: black-on-white)': {
    MsHighContrastAdjust: 'none',
  },
};

const highContrastItemAndTitleStateMixin: IRawStyle = {
  selectors: {
    [HighContrastSelector]: {
      backgroundColor: 'Highlight',
      borderColor: 'Highlight',
      color: 'HighlightText',
      selectors: {
        ':hover': {
          color: 'HighlightText', // overrides the hover styling for buttons that are also selected
        },
      },
    },
    ...highContrastAdjustMixin,
  },
};

const highContrastBorderState: IRawStyle = {
  selectors: {
    [HighContrastSelector]: {
      borderColor: 'Highlight',
    },
  },
};

interface StyleProps extends IDropdownStyleProps {
  theme: ThemeExtended | undefined;
}
export const DropdownStyles: IStyleFunction<StyleProps, IDropdownStyles> = props => {
  const { theme, hasError, className, isOpen, disabled, required, isRenderingPlaceholder, panelClassName, calloutClassName } = props;
  if (!theme) {
    throw new Error('theme is undefined or null in base Dropdown getStyles function.');
  }

  const globalClassnames = getGlobalClassNames(GlobalClassNames, theme);
  const semanticColors = theme.semanticColors as AzurePortalColors;

  const rootHoverFocusActiveSelectorNeutralDarkMixin: IStyle = {
    color: semanticColors.textControlOutlineHovered,
  };

  const rootHoverFocusActiveSelectorBodySubtextMixin: IStyle = {
    color: semanticColors.textColor,
  };

  const borderColorError: IStyle = {
    borderColor: semanticColors.inlineErrorText,
  };

  const dropdownItemStyle: IStyle = [
    globalClassnames.dropdownItem,
    {
      backgroundColor: 'transparent',
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'block',
      padding: '4px 16px',
      width: '100%',
      minHeight: DROPDOWN_ITEMHEIGHT,
      lineHeight: 20,
      height: 'auto',
      position: 'relative',
      border: '1px solid transparent',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      textAlign: 'left',
    },
  ];

  const dropdownItemSelected: IStyle = [
    ...dropdownItemStyle,
    {
      backgroundColor: semanticColors.itemBackgroundOnSelect,
      color: semanticColors.textColor,
    },
    highContrastItemAndTitleStateMixin,
  ];

  const dropdownItemDisabled: IStyle = [
    ...dropdownItemStyle,
    {
      color: semanticColors.disabledText,
      cursor: 'default',
    },
  ];

  return {
    root: [
      globalClassnames.root,
      {
        marginTop: '0px',
        marginBottom: '15px',
      },
    ],
    label: [
      globalClassnames.label,
      {
        boxSizing: 'border-box',
        minHeight: '20px',
        width: '200px',
      },
    ],
    dropdown: [
      globalClassnames.dropdown,
      normalize,
      {
        ...theme.fonts.small,
        color: semanticColors.textColor,
        position: 'relative',
        outline: 0,
        userSelect: 'none',
        selectors: {
          [`&:hover .${globalClassnames.title}`]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: semanticColors.standardControlOutlineHover },
            highContrastBorderState,
          ],
          [`&:focus .${globalClassnames.title}`]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: semanticColors.standardControlOutlineAccent },
            highContrastItemAndTitleStateMixin,
          ],
          ['&:active .' + globalClassnames.title]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: semanticColors.standardControlOutlineAccent },
            highContrastBorderState,
          ],

          ['&:hover .' + globalClassnames.caretDown]: !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
          ['&:focus .' + globalClassnames.caretDown]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { selectors: { [HighContrastSelector]: { color: 'HighlightText' }, ...highContrastAdjustMixin } },
          ],
          ['&:active .' + globalClassnames.caretDown]: !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,

          ['&:hover .' + globalClassnames.titleIsPlaceHolder]: rootHoverFocusActiveSelectorBodySubtextMixin,
          ['&:focus .' + globalClassnames.titleIsPlaceHolder]: rootHoverFocusActiveSelectorBodySubtextMixin,
          ['&:active .' + globalClassnames.titleIsPlaceHolder]: rootHoverFocusActiveSelectorBodySubtextMixin,

          ['&:hover .' + globalClassnames.titleHasError]: borderColorError,
          ['&:active .' + globalClassnames.titleHasError]: borderColorError,
          ['&:focus .' + globalClassnames.titleHasError]: borderColorError,
        },
      },
      className,
      isOpen && 'is-open',
      disabled && 'is-disabled',
      required && 'is-required',
      {
        verticalAlign: 'middle',
        width: '100%',
        maxWidth: '265px',
        minWidth: '75px',
      },
    ],
    title: [
      globalClassnames.title,
      normalize,
      {
        backgroundColor: semanticColors.background,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: semanticColors.standardControlOutlineRest,
        cursor: 'pointer',
        display: 'block',
        height: DROPDOWN_HEIGHT,
        lineHeight: DROPDOWN_HEIGHT - 2,
        padding: `0 ${DROPDOWN_HEIGHT}px 0 12px`,
        position: 'relative',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
      isRenderingPlaceholder && [globalClassnames.titleIsPlaceHolder, { color: semanticColors.placeholderText }],
      hasError && [globalClassnames.titleHasError, borderColorError],
      disabled && {
        backgroundColor: 'rgba(127,127,127,.1)',
        border: `1px solid ${semanticColors.disabledText}`,
        color: semanticColors.textColor,
        cursor: 'default',
        selectors: { [HighContrastSelector]: { border: '1px solid GrayText', color: 'GrayText' } },
      },
    ],
    caretDownWrapper: [
      globalClassnames.caretDownWrapper,
      {
        position: 'absolute',
        top: 1,
        right: 12,
        height: DROPDOWN_HEIGHT,
        lineHeight: DROPDOWN_HEIGHT - 2, // height minus the border
      },
    ],
    caretDown: [
      globalClassnames.caretDown,
      { color: semanticColors.textColor, fontSize: FontSizes.small, pointerEvents: 'none' },
      disabled && { color: semanticColors.disabledText, selectors: { [HighContrastSelector]: { color: 'GrayText' } } },
    ],
    errorMessage: { color: semanticColors.inlineErrorText, ...theme.fonts.small, paddingTop: 5 },
    callout: [
      globalClassnames.callout,
      {
        boxShadow: '0 0 2px 0 rgba(0,0,0,0.2)',
        border: `1px solid ${semanticColors.standardControlOutlineRest}`,
      },
      calloutClassName,
    ],
    panel: [
      globalClassnames.panel,
      {
        // #5689: use subcomponentstyles when panel is converted to use js styling.
        selectors: {
          '& .ms-Panel-main': {
            // Force drop shadow even under medium breakpoint
            boxShadow: '-30px 0px 30px -30px rgba(0,0,0,0.2)',
          },
          '& .ms-Panel-contentInner': { padding: '0 0 20px' },
        },
      },
      panelClassName,
    ],
    dropdownItemsWrapper: { selectors: { '&:focus': { outline: 0 } } },
    dropdownItems: [globalClassnames.dropdownItems, { display: 'block' }],
    dropdownItem: [
      ...dropdownItemStyle,
      dropdownItemSelected,
      dropdownItemDisabled,
      {
        selectors: {
          [HighContrastSelector]: {
            borderColor: 'Window',
          },
          '&:hover': {
            color: 'inherit',
          },
          '&:focus': {
            backgroundColor: semanticColors.itemBackgroundOnSelect,
          },
          '&:active': {
            backgroundColor: semanticColors.itemBackgroundOnSelect,
            color: semanticColors.textColor,
          },
        },
      },
    ],
    dropdownItemSelectedAndDisabled: [dropdownItemSelected, dropdownItemDisabled, { backgroundColor: 'transparent' }],
    dropdownDivider: [globalClassnames.dropdownDivider, { height: 1, backgroundColor: semanticColors.sectionDividerScrollbar }],
    dropdownOptionText: [
      globalClassnames.dropdownOptionText,
      {
        color: semanticColors.textColor,
      },
      {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        minWidth: 0,
        maxWidth: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        margin: '1px',
      },
    ],
    dropdownItemHeader: [
      globalClassnames.dropdownItemHeader,
      {
        ...theme.fonts.small,
        fontWeight: FontWeights.semibold,
        color: semanticColors.textColor,
        background: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        height: DROPDOWN_ITEMHEIGHT,
        lineHeight: DROPDOWN_ITEMHEIGHT,
        cursor: 'default',
        padding: '0px 16px',
        userSelect: 'none',
        textAlign: 'left',
      },
    ],
    subComponentStyles: { label: { root: { display: 'inline-block' } } },
  };
};
