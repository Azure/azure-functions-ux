import { configure } from '@storybook/react';

function loadStories() {
  require('../src/components/loading/loading-component.stories');
}

configure(loadStories, module);
