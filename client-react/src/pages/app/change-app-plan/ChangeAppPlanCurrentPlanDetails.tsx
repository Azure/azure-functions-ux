import { Stack } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../components/form-controls/ReactiveFormControl';
import { ArmObj } from '../../../models/arm-obj';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { ArmPlanDescriptor } from '../../../utils/resourceDescriptors';
import { labelSectionStyle, sectionStyle } from './ChangeAppPlan.styles';
import { CurrentPlanDetailsProps } from './ChangeAppPlan.types';

export const CurrentPlanDetails: React.FC<CurrentPlanDetailsProps> = ({ currentServerFarm }) => {
  const { t } = useTranslation();

  return (
    <>
      <Stack className={sectionStyle}>
        <h4 className={labelSectionStyle}>{t('changePlanCurrentPlanDetails')}</h4>
      </Stack>

      <ReactiveFormControl id="currentAppServicePlan" label={t('appServicePlan')}>
        <div tabIndex={0} aria-label={`${t('appServicePlan')} ${getPlanName(currentServerFarm)}`}>
          {getPlanName(currentServerFarm)}
        </div>
      </ReactiveFormControl>
    </>
  );
};

const getPlanName = (serverFarm: ArmObj<ServerFarm>) => {
  const descriptor = new ArmPlanDescriptor(serverFarm.id);
  return descriptor.name;
};
