/**
 * @format
 */

import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import { AppRegistry } from 'react-native';
import { proximityUnlockTask } from './frontend/features/proximity/headless/proximity-unlock-task';
import App from './frontend/App';
import { name as appName } from './app.json';

AppRegistry.registerHeadlessTask('ProximityUnlock', () => proximityUnlockTask);
AppRegistry.registerComponent(appName, () => App);
