import React from 'react';
import { Icon, Link, Stack } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';

const EventGridIntegration = props => {
  const { t } = useTranslation();

  return (
    <div>
      <h3>{t('eventGridInput')}</h3>

      <Link href="">{t('goToEventGridAccount')}</Link>
      <Link href="linkToDocs">
        <Stack horizontal verticalAlign="center">
          <span>{t('learnMoreAboutEventGridInputs')}</span>
          <Icon iconName="OpenInNewWindow" />
        </Stack>
      </Link>
    </div>
  );
};

export default EventGridIntegration;
