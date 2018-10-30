import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ReactSVG from 'react-svg';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { ITheme } from '@uifabric/styling';
import IState from '../../modules/types';
import { style } from 'typestyle';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { String } from '../../utils/string';

interface InformationCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
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

const learnMoreLinkStyle = style({
  marginLeft: '5px',
});

const InformationCard = (props: InformationCardPropsCombined) => {
  const { id, icon, title, description, learnMore, t, theme } = props;
  const titleHeaderId = `${id}-title`;
  const informationCardDivStyle = style({ backgroundColor: theme.semanticColors.defaultStateBackground });

  return (
    <div className={informationCardDivStyle}>
      <div className={iconDivStyle}>
        <ReactSVG className={iconStyle} src={icon} />
      </div>
      <div className={bodyDivStyle}>
        <h4 id={titleHeaderId} className={titleHeaderStyle}>
          {t(title)}
        </h4>
        <div className={descriptionDivStyle}>
          {t(description)}
          {learnMore && (
            <Link href={learnMore.learnMoreLink} target="_blank" className={learnMoreLinkStyle} aria-describedby={titleHeaderId}>
              {t(learnMore.learnMoreText)}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => ({
  theme: state.portalService.theme,
});
export default compose<InformationCardPropsCombined, InformationCardProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(InformationCard);
