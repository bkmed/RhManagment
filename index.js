import {AppRegistry} from 'react-native'
import App from './src/index.tsx'
import {name as appName} from './src/app.json'

AppRegistry.registerComponent(appName, () => App)
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
})
