import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteStateContext';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyle } from './EditModeBanner.styles';
import { ThemeContext } from '../../ThemeContext';

interface EditModeBannerProps {}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteState = useContext(SiteStateContext);
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  if (!SiteHelper.isFunctionAppReadOnly(siteState)) {
    return <></>;
  }
  return (
    <MessageBar id="site-state-banner" isMultiline={false} className={messageBannerStyle(theme)} messageBarType={MessageBarType.info}>
      {SiteHelper.getFunctionAppEditModeString(siteState, t)}
    </MessageBar>
  );
};
export default EditModeBanner;
