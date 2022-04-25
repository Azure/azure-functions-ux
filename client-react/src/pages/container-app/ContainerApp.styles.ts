import { mergeStyleSets } from '@fluentui/react/lib/Styling';

export const containerAppStyles = mergeStyleSets({
  customTextField: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divContainer: {
    height: '100vh',
    overflow: 'hidden',
  },
  dialogFooterAlignLeft: {
    textAlign: 'left',
  },
});
