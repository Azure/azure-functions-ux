import React, { useContext } from 'react';
import { SiteCommunicatorContext } from '../../SiteCommunicatorContext';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBarType } from 'office-ui-fabric-react';
import CustomBanner from '../CustomBanner/CustomBanner';

interface EditModeBannerProps {
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteCommunicatorContext = useContext(SiteCommunicatorContext);
  const { t } = useTranslation();

  const { setBanner } = props;

  const editState = siteCommunicatorContext.getSiteAppEditState();

  if (SiteHelper.isFunctionAppReadOnly(editState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <CustomBanner message={SiteHelper.getFunctionAppEditModeString(editState, t)} type={MessageBarType.info} />
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
