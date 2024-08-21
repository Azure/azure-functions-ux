import { style } from 'typestyle';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';

export const getCalloutContainerStyles = (layout: Layout): string => {
  return layout === Layout.Horizontal
    ? style({
        marginBottom: '15px',
        marginRight: '162px',
        marginTop: '-15px',
        minWidth: '235px',
        textAlign: 'right',
      })
    : style({
        marginBottom: '15px',
        marginTop: '-15px',
      });
};
