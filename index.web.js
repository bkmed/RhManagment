import { AppRegistry } from 'react-native';
import App from './App';
import { initSentry } from './src/services/sentry.web';

initSentry();
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

const rootTag =
  document.getElementById('app-root') || document.getElementById('root');
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag,
});
