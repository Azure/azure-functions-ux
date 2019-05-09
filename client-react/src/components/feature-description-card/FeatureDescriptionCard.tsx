import * as React from 'react';
import ReactSVG from 'react-svg';
import { style } from 'typestyle';

interface FeatureDescriptionCardProps {
  name: string;
  description: string;
  iconUrl: string;
  learnMoreLink?: string;
}

const iconClass = style({
  height: '50px',
  width: '50px',
  display: 'inline-block',
});

const headerClass = style({
  display: 'inline-block',
  verticalAlign: 'bottom',
  marginTop: '0px',
  marginLeft: '10px',
  fontSize: '17px',
  borderBottom: '1px solid #000',
  paddingBottom: '5px',
});

const descriptionClass = style({
  maxWidth: '725px',
  fontSize: '13px',
});

const FeatureDescriptionCard = (props: FeatureDescriptionCardProps) => {
  const { iconUrl, name, description } = props;

  return (
    <div className={descriptionClass}>
      <span className={iconClass}>
        <ReactSVG src={iconUrl} />
      </span>
      <h2 className={headerClass}>{name}</h2>
      <div>{description}</div>
    </div>
  );
};

export default FeatureDescriptionCard;
