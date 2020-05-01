import { mergeStyleSets, FontWeights } from 'office-ui-fabric-react';

export const focusTrapCalloutStyle = mergeStyleSets({
  dialog: {
    maxWidth: '300px',
  },
  header: {
    padding: '18px 24px 12px',
  },
  title: {
    margin: 0,
    fontWeight: FontWeights.regular,
  },
  inner: {
    height: '100%',
    padding: '0 24px 20px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 24px 24px',
  },
  subtext: {
    margin: 0,
    fontWeight: FontWeights.semilight,
  },
});
