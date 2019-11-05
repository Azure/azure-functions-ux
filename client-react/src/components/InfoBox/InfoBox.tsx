import React, { useContext } from 'react';

import { ThemeContext } from '../../ThemeContext';
import { Stack, Icon, Link } from 'office-ui-fabric-react';
import { infoIconStyle, warningIconStyle, errorIconStyle, learnMoreLinkStyle } from '../form-controls/formControl.override.styles';

interface InfoBoxProps {
  id: string;
  type?: 'Info' | 'Warning' | 'Error';
  message: string;
  additionalInfoLink?: {
    url: string;
    text: string;
  };
}

const InfoBox = (props: InfoBoxProps) => {
  const theme = useContext(ThemeContext);
  const { id, type, message, additionalInfoLink } = props;
  const messageId = `${id}-message`;

  const getIconNameAndStyle = () => {
    if (type === 'Info') {
      return { iconName: 'Info', iconStyle: infoIconStyle(theme) };
    }

    if (type === 'Warning') {
      return { iconName: 'Warning', iconStyle: warningIconStyle(theme) };
    }

    if (type === 'Error') {
      return { iconName: 'Error', iconStyle: errorIconStyle(theme) };
    }

    return { iconName: 'Info', iconStyle: infoIconStyle(theme) };
  };

  const { iconName, iconStyle } = getIconNameAndStyle();

  return (
    <Stack horizontal verticalAlign="center">
      <Icon iconName={iconName} className={iconStyle} />
      <p>
        <span id={messageId}>{message}</span>
        {additionalInfoLink && (
          <Link href={additionalInfoLink.url} target="_blank" className={learnMoreLinkStyle} aria-describedby={messageId}>
            {` ${additionalInfoLink.text}`}
          </Link>
        )}
      </p>
    </Stack>
  );
};

export default InfoBox;
