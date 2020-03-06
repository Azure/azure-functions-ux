import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteStateContext';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBarType } from 'office-ui-fabric-react';
import { ReactComponent as InfoSvg } from '../../images/Common/ibiza-info.svg';
import CustomBanner from '../CustomBanner/CustomBanner';

interface EditModeBannerProps {
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteState = useContext(SiteStateContext);
  const { t } = useTranslation();

  const { setBanner } = props;

  if (SiteHelper.isFunctionAppReadOnly(siteState.readOnlyState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <CustomBanner
          message={SiteHelper.getFunctionAppEditModeString(siteState.readOnlyState, t)}
          icon={<InfoSvg />}
          type={MessageBarType.info}
        />
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
