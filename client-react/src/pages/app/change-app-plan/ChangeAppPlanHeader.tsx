import { useTranslation } from 'react-i18next';
import FeatureDescriptionCard from '../../../components/feature-description-card/FeatureDescriptionCard';
import { ReactComponent as AppServicePlanSvg } from '../../../images/AppService/app-service-plan.svg';

export const ChangeAppPlanHeader: React.FC<{}> = () => {
  const { t } = useTranslation();

  return (
    <header>
      <FeatureDescriptionCard name={t('changePlanName')} description={t('changePlanDescription')} Svg={AppServicePlanSvg} />
    </header>
  );
};
