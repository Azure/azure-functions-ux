import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteState';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBarType } from 'office-ui-fabric-react';
import CustomBanner from '../CustomBanner/CustomBanner';

interface EditModeBannerProps {
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteStateContext = useContext(SiteStateContext);
  const { t } = useTranslation();

  const { setBanner } = props;

  const editState = siteStateContext.siteAppEditState;

  if (SiteHelper.isFunctionAppReadOnly(editState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <CustomBanner
          message={SiteHelper.getFunctionAppEditModeString(editState, t)}
          type={MessageBarType.info}
          learnMoreLink={SiteHelper.getLearnMoreLinkForFunctionAppEditMode(editState)}
        />
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
