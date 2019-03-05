import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LoadingComponent from './loading-component';
storiesOf('Loading Component', module)
  .add('Loading with no errors', () => (
    <LoadingComponent pastDelay={true} error={false} isLoading={true} timedOut={false} retry={action('retried')} />
  ))
  .add('Loading but not past delay', () => (
    <LoadingComponent pastDelay={false} error={false} isLoading={true} timedOut={false} retry={action('retried')} />
  ))
  .add('Loading failed', () => (
    <LoadingComponent pastDelay={false} error="error" isLoading={true} timedOut={false} retry={action('retried')} />
  ))
  .add('Timed out', () => <LoadingComponent pastDelay={false} error={false} isLoading={true} timedOut={true} retry={action('retried')} />);
