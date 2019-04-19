import { IChoiceGroupStyleProps, IChoiceGroupStyles } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { getGlobalClassNames } from '@uifabric/styling';
import { ThemeExtended } from '../../SemanticColorsExtended';
import { IStyleFunction } from 'office-ui-fabric-react/lib/Utilities';

const GlobalClassNames = {
  root: 'ms-ChoiceFieldGroup',
  flexContainer: 'ms-ChoiceFieldGroup-flexContainer',
};

interface StyleProps extends IChoiceGroupStyleProps {
  theme: ThemeExtended;
}
export const ChoiceGroupStyles: IStyleFunction<StyleProps, IChoiceGroupStyles> = props => {
  const { className, theme } = props;

  const classNames = getGlobalClassNames(GlobalClassNames, theme);

  return {
    applicationRole: className,
    root: [
      classNames.root,
      theme.fonts.medium,
      {
        display: 'block',
        minWidth: '120px',
      },
    ],
    flexContainer: [
      classNames.flexContainer,
      {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
    ],
  };
};
