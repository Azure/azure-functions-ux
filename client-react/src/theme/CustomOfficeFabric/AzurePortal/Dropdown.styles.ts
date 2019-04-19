// tslint:disable:prefer-template
import { ThemeExtended } from '../../SemanticColorsExtended';
import { getGlobalClassNames, IStyle } from '@uifabric/styling';

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

export const DropDownStyles = props => {
  const { palette, semanticColors, fonts } = props.theme as ThemeExtended;
  const { disabled, isRenderingPlaceholder } = props;

  const borderColorError: IStyle = {
    borderColor: semanticColors.errorText,
  };

  const dropdownItemStyle: IStyle = [
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
      backgroundColor: palette.neutralQuaternaryAlt,
      color: palette.black,
    },
  ];

  const dropdownItemDisabled: IStyle = [
    ...dropdownItemStyle,
    {
      color: semanticColors.disabledText,
      cursor: 'default',
    },
  ];

  const globalClassnames = getGlobalClassNames(GlobalClassNames, props.theme!);
  return {
    root: [
      {
        marginTop: '0px',
      },
    ],
    label: [
      {
        boxSizing: 'border-box',
        minHeight: '20px',
        width: '200px',
      },
    ],
    dropdown: [
      {
        ...fonts.small,
        color: semanticColors.textColor,
        selectors: {
          [`&:hover .${globalClassnames.title}`]: [{ borderColor: semanticColors.standardControlOutlineHover }],
          [`&:focus .${globalClassnames.title}`]: [{ borderColor: semanticColors.standardControlOutlineAccent }],
          ['&:active .' + globalClassnames.title]: [{ borderColor: semanticColors.standardControlOutlineAccent }],
          ['&:hover .' + globalClassnames.titleHasError]: borderColorError,
          ['&:active .' + globalClassnames.titleHasError]: borderColorError,
          ['&:focus .' + globalClassnames.titleHasError]: borderColorError,
        },
      },
      {
        verticalAlign: 'middle',
        width: '100%',
        maxWidth: '275px',
        minWidth: '75px',
      },
    ],
    title: [
      {
        backgroundColor: semanticColors.background,
        borderColor: semanticColors.standardControlOutlineRest,
        height: DROPDOWN_HEIGHT,
        lineHeight: DROPDOWN_HEIGHT - 2,
        padding: `0 ${DROPDOWN_HEIGHT}px 0 12px`,
      },
      isRenderingPlaceholder && [globalClassnames.titleIsPlaceHolder, { color: semanticColors.placeholderText }],
      disabled && {
        backgroundColor: semanticColors.disabledControlBackground,
        border: `1px solid ${semanticColors.disabledText}`,
        color: semanticColors.textColor,
        cursor: 'default',
      },
    ],
    caretDown: [{ color: semanticColors.textColor }],
    caretDownWrapper: [{ height: `${DROPDOWN_HEIGHT}px`, lineHeight: `${DROPDOWN_HEIGHT}px` }],
    errorMessage: [{ color: semanticColors.inlineErrorText }],
    callout: [
      {
        border: `1px solid ${semanticColors.standardControlOutlineRest}`,
        backgroundColor: semanticColors.bodyBackground,
      },
    ],
    dropdownItem: [
      ...dropdownItemStyle,
      dropdownItemSelected,
      dropdownItemDisabled,
      {
        selectors: {
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
    dropdownDivider: [{ backgroundColor: semanticColors.sectionDividerScrollbar }],
    dropdownOptionText: [
      {
        color: semanticColors.textColor,
      },
    ],
    dropdownItemHeader: [
      globalClassnames.dropdownItemHeader,
      {
        ...fonts.small,
        color: semanticColors.textColor,
        height: DROPDOWN_ITEMHEIGHT,
        lineHeight: DROPDOWN_ITEMHEIGHT,
      },
    ],
  };
};
