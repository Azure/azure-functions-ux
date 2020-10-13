import './polyfills';
import { initializeIcons } from '@uifabric/icons';
import React from 'react';
import * as ReactDOM from 'react-dom';
import App from './pages/App';
import { lightTheme } from './theme/light';
import { loadTheme } from '@uifabric/styling';
import 'react-app-polyfill/ie11';
import LogService from './utils/LogService';
import Url from './utils/url';

LogService.initialize();
initializeIcons(Url.getParameterByName(null, 'officeFabricIconsCdn') || undefined);
loadTheme(lightTheme); // make sure we load a custom theme before anything else, custom theme has custom semantic colors

LogService.startTrackPage('shell');

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
