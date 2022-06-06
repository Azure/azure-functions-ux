import { PrimaryButton } from '@fluentui/react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../ThemeContext';
import { buttonFooterStyle, buttonPadding } from './ChangeAppPlan.styles';
import { ChangeAppPlanFooterProps } from './ChangeAppPlan.types';

export const ChangeAppPlanFooter: React.FC<ChangeAppPlanFooterProps> = ({ isUpdating, siteIsReadOnlyLocked, submitForm }) => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <div className={buttonFooterStyle(theme)}>
      <PrimaryButton
        text={t('ok')}
        ariaLabel={t('ok')}
        className={buttonPadding}
        data-automation-id="test"
        allowDisabledFocus={true}
        onClick={submitForm}
        disabled={isUpdating || siteIsReadOnlyLocked}
      />
    </div>
  );
};
