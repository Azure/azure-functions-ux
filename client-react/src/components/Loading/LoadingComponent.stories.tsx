import { storiesOf } from '@storybook/react';
import LoadingComponent from './LoadingComponent';

storiesOf('Loading Component', module).add('Loading with no errors', () => <LoadingComponent />);
