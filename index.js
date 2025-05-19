/**
 * @format
 */

import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import { AppRegistry } from 'react-native';
import App from './frontend/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
