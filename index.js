import {AppRegistry} from 'react-native'
import App from './src/index'
import {name as appName} from './src/app.json'

AppRegistry.registerComponent(appName, () => App)
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
})
