import * as React from 'react';
import { compose } from 'recompose';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';
import { PriceSpecDetail } from './specs/PriceSpec';
import InformationCard from '../../../components/InformationCard/InformationCard';

interface SpecPickerFeatureListProps {
  title: string;
  description: string;
  features: PriceSpecDetail[];
}

const featureListDivStyle = style({
  padding: '10px',
  maxWidth: '700px',
  marginTop: '10px',
  width: 'calc(100% / 2)',
});

type SpecPickerFeatureListPropsCombined = SpecPickerFeatureListProps & InjectedTranslateProps;
class SpecPickerFeatureList extends React.Component<SpecPickerFeatureListPropsCombined, {}> {
  public render() {
    const { t, title, description, features } = this.props;
    const informationCards: JSX.Element[] = [];

    for (const feature of features) {
      const informationCardProps = {
        id: feature.id,
        icon: feature.iconUrl,
        title: feature.title,
        description: feature.description,
        additionalInfoLink: !!feature.learnMoreUrl
          ? {
              url: feature.learnMoreUrl,
              text: t('learnMore'),
            }
          : undefined,
      };
      informationCards.push(<InformationCard {...informationCardProps} />);
    }

    return (
      <div className={featureListDivStyle}>
        <h2>{title}</h2>
        <div>{description}</div>
        {informationCards}
      </div>
    );
  }
}

export default compose<SpecPickerFeatureListPropsCombined, SpecPickerFeatureListProps>(translate('translation'))(SpecPickerFeatureList);
