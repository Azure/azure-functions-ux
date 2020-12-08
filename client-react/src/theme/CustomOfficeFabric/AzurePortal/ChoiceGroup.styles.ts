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

interface GroupStyleProps extends StyleProps {
  setVerticalLayout: boolean;
}

const GroupStyles: IStyleFunction<GroupStyleProps, IChoiceGroupStyles> = props => {
  const { className, theme, setVerticalLayout } = props;

  const classNames = getGlobalClassNames(GlobalClassNames, theme);

  return {
    applicationRole: className,
    root: [
      classNames.root,
      theme.fonts.medium,
      {
        display: 'block',
        minWidth: '120px',
        selectors: {
          '.ms-ChoiceField': {
            paddingTop: '0px',
            marginTop: '0px',
          },
        },
      },
    ],
    flexContainer: [
      classNames.flexContainer,
      {
        display: 'flex',
        flexDirection: setVerticalLayout ? 'column' : 'row',
        flexWrap: 'wrap',
      },
    ],
  };
};

export const ChoiceGroupStyles: IStyleFunction<StyleProps, IChoiceGroupStyles> = props => {
  return GroupStyles({
    ...props,
    setVerticalLayout: false,
  });
};

export const ChoiceGroupVerticalStyles: IStyleFunction<StyleProps, IChoiceGroupStyles> = props => {
  return GroupStyles({
    ...props,
    setVerticalLayout: true,
  });
};
