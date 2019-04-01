import React from 'react';
import { useTranslation } from 'react-i18next';
import { featureListDivStyle } from './SpecPicker.styles';
import { PriceSpecDetail } from './specs/PriceSpec';
import InformationCard from '../../../components/InformationCard/InformationCard';

interface SpecPickerFeatureListProps {
  title: string;
  description: string;
  features: PriceSpecDetail[];
}

const SpecPickerFeatureList: React.FC<SpecPickerFeatureListProps> = props => {
  const { title, description, features } = props;
  const { t } = useTranslation();
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
};

export default SpecPickerFeatureList;
