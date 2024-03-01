import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteState';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBarType } from '@fluentui/react';
import CustomBanner from '../CustomBanner/CustomBanner';
import { FunctionAppEditMode } from '../../models/portal-models';
import { fetchUserId, getVsCodeForTheWebLink } from '../../pages/app/functions/common/VsCodeForTheWebHelper';
import { PortalContext } from '../../PortalContext';

interface EditModeBannerProps {
  resourceId?: string;
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteStateContext = useContext(SiteStateContext);
  const { t } = useTranslation();

  const { resourceId, setBanner } = props;

  const editState = siteStateContext.siteAppEditState;

  const portalCommunicator = useContext(PortalContext);

  const handleVsCodeWebClick = async () => {
    const userAccountId = await fetchUserId(portalCommunicator);

    if (resourceId && userAccountId && editState === FunctionAppEditMode.ReadOnlyVsCodeForTheWeb) {
      const uri = getVsCodeForTheWebLink(resourceId, userAccountId, 'deployed');
      window.open(uri, '_blank');
    }
  };

  if (SiteHelper.isFunctionAppReadOnly(editState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <CustomBanner
          message={SiteHelper.getFunctionAppEditModeString(editState, t)}
          type={MessageBarType.info}
          learnMoreLink={SiteHelper.getLearnMoreLinkForFunctionAppEditMode(editState)}
          onClick={handleVsCodeWebClick}
        />
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
