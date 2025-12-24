import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

const rootTag =
  document.getElementById('app-root') || document.getElementById('root');
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag,
});
