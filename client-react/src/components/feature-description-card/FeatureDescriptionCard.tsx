import * as React from 'react';
import { style } from 'typestyle';
import '../../theme/images.css';

interface FeatureDescriptionCardProps {
  name: string;
  description: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
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
  const { Svg, name, description } = props;

  return (
    <div className={descriptionClass}>
      <span className={iconClass}>
        <Svg />
      </span>
      <h2 className={headerClass}>{name}</h2>
      <div>{description}</div>
    </div>
  );
};

export default FeatureDescriptionCard;
