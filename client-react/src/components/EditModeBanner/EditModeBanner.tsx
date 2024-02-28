import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteState';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBarType } from '@fluentui/react';
import CustomBanner from '../CustomBanner/CustomBanner';
import { FunctionAppEditMode } from '../../models/portal-models';
import { fetchAuthToken, getVsCodeForTheWebLink } from '../../pages/app/functions/common/VsCodeForTheWebHelper';
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

  const handleVSCodeForTheWebClick = async () => {
    if (editState === FunctionAppEditMode.ReadOnlyVsCodeForTheWeb && resourceId) {
      const authToken = await fetchAuthToken(portalCommunicator);
      const uri = getVsCodeForTheWebLink(resourceId, authToken as string);
      window.open(await uri, '_blank');
    }
  };

  if (SiteHelper.isFunctionAppReadOnly(editState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <CustomBanner
          message={SiteHelper.getFunctionAppEditModeString(editState, t)}
          type={MessageBarType.info}
          learnMoreLink={SiteHelper.getLearnMoreLinkForFunctionAppEditMode(editState)}
          onClick={handleVSCodeForTheWebClick}
        />
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
