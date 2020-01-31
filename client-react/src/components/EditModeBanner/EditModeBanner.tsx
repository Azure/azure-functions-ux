import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteStateContext';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyle } from './EditModeBanner.styles';
import { ThemeContext } from '../../ThemeContext';

interface EditModeBannerProps {
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteState = useContext(SiteStateContext);
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const { setBanner } = props;

  if (SiteHelper.isFunctionAppReadOnly(siteState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <MessageBar id="site-state-banner" isMultiline={true} className={messageBannerStyle(theme)} messageBarType={MessageBarType.info}>
          {SiteHelper.getFunctionAppEditModeString(siteState, t)}
        </MessageBar>
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
