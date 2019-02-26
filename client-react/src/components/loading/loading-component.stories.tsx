import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingComponent from './loading-component';
storiesOf('Loading Component', module).add('Loading with no errors', () => <LoadingComponent />);
