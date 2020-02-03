import { ICommandBarStyleProps, ICommandBarStyles } from 'office-ui-fabric-react';

export const CommandBarStyles = (props: ICommandBarStyleProps): ICommandBarStyles => {
  const { theme } = props;
  const { semanticColors } = theme;
  return {
    root: [
      {
        height: '40px',
        borderBottom: '1px solid rgba(204,204,204,.8)',
        backgroundColor: semanticColors.bodyBackground,
        width: '100%',
      },
    ],
    secondarySet: {
      marginRight: '20px',
    },
  };
};
