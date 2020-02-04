import { storiesOf } from '@storybook/react';
import React from 'react';
import LoadingComponent from './LoadingComponent';

storiesOf('Loading Component', module).add('Loading with no errors', () => <LoadingComponent />);
