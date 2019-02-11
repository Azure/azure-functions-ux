import { ICommandBarStyleProps, ICommandBarStyles } from 'office-ui-fabric-react';

export const CommandBarStyles = (props: ICommandBarStyleProps): ICommandBarStyles => {
  const { className, theme } = props;
  const { semanticColors } = theme;

  return {
    root: [
      theme.fonts.medium,
      'ms-CommandBar',
      {
        display: 'flex',
        padding: '0 16px',
        height: '40px',
        borderBottom: '1px solid rgba(204,204,204,.8)',
        backgroundColor: semanticColors.bodyBackground,
        width: '100%',
      },
      className,
    ],
    primarySet: [
      'ms-CommandBar-primaryCommand',
      {
        flexGrow: '1',
        display: 'flex',
        alignItems: 'stretch',
      },
    ],
    secondarySet: [
      'ms-CommandBar-secondaryCommand',
      {
        flexShrink: '0',
        display: 'flex',
        alignItems: 'stretch',
      },
    ],
  };
};
