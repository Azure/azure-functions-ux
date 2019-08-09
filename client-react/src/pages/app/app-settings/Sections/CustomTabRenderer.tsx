import React from 'react';
import { IPivotItemProps, Icon } from 'office-ui-fabric-react';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
const CustomTabRenderer = (
  link: IPivotItemProps,
  defaultRenderer: (link: IPivotItemProps) => JSX.Element,
  theme: ThemeExtended,
  dirtyCheck?: () => boolean,
  dirtyLabel?: string,
  errorCheck?: () => boolean
) => {
  let iconState: 'error' | 'dirty' | '' = '';
  if (errorCheck && errorCheck()) {
    iconState = 'error';
  } else if (dirtyCheck && dirtyCheck()) {
    iconState = 'dirty';
  }

  return (
    <span>
      {defaultRenderer(link)}
      {iconState === 'error' && (
        <Icon
          iconName="CircleFill"
          id={`${link.itemKey}-error-icon`}
          styles={{
            root: {
              fontSize: '10px',
              color: theme.semanticColors.errorText,
              paddingLeft: '5px',
            },
          }}
        />
      )}
      {iconState === 'dirty' && (
        <Icon
          iconName="Asterisk"
          id={`${link.itemKey}-dirty-icon`}
          ariaLabel={dirtyLabel}
          styles={{
            root: {
              fontSize: '10px',
              color: theme.semanticColors.controlDirtyOutline,
              paddingLeft: '5px',
            },
          }}
        />
      )}
    </span>
  );
};

export default CustomTabRenderer;
