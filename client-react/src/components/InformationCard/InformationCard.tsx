import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg';
import { compose } from 'recompose';
import { style } from 'typestyle';

import { ITheme } from '@uifabric/styling';

import { RootState } from '../../modules/types';

interface InformationCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  additionalInfoLink?: {
    url: string;
    text: string;
  };
}

interface IStateProps {
  theme: ITheme;
}

type InformationCardPropsCombined = InformationCardProps & InjectedTranslateProps & IStateProps;

const iconDivStyle = style({
  display: 'inline-block',
  margin: '10px',
});

const iconStyle = style({
  left: '10px',
  width: '40px',
  height: '40px',
});

const bodyDivStyle = style({
  margin: '10px',
  display: 'inline-block',
  verticalAlign: 'top',
  maxWidth: 'calc(100% - 100px)',
});

const titleHeaderStyle = style({
  fontSize: '12px',
  fontWeight: 'bold',
  marginBlockStart: '0',
  marginBlockEnd: '0',
});

const descriptionDivStyle = style({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

const additionalInfoLinkStyle = style({
  marginLeft: '5px',
});

const InformationCard = (props: InformationCardPropsCombined) => {
  const { id, icon, title, description, additionalInfoLink, theme } = props;
  const titleHeaderId = `${id}-title`;
  const informationCardDivStyle = style({ backgroundColor: theme.semanticColors.defaultStateBackground, margin: '5px 0' });

  return (
    <div className={informationCardDivStyle}>
      <div className={iconDivStyle}>
        <ReactSVG className={iconStyle} src={icon} />
      </div>
      <div className={bodyDivStyle}>
        <h4 id={titleHeaderId} className={titleHeaderStyle}>
          {title}
        </h4>
        <div className={descriptionDivStyle}>
          {description}
          {additionalInfoLink && (
            <Link href={additionalInfoLink.url} target="_blank" className={additionalInfoLinkStyle} aria-describedby={titleHeaderId}>
              {additionalInfoLink.text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  theme: state.portalService.theme,
});
export default compose<InformationCardPropsCombined, InformationCardProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(InformationCard);
