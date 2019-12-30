import { AppRegistry, Alert } from 'react-native';
import App from './App';

import { LogInfo, LogException } from './src/api/Logger';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import { GlobalTask } from './src/api/GlobalTask'

const errorHandler = (e, isFatal) => {
    if (isFatal) {

        LogException('全局异常', '异常信息：' + e.name + ' , ' + e.message);
        Alert.alert(
            'Unexpected error occurred',
            `
          Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}
          We have reported this to our team ! Please close the app and start again!
          `,
            [{
                text: 'Close',
                onPress: () => {
                }
            }]
        );
    } else {
        LogException('全局异常', '异常信息：' + e.name + ' , ' + e.message);
        //console.log(e); // So that we can see it in the ADB logs in case of Android if needed
    }
};

setJSExceptionHandler(errorHandler, true);

AppRegistry.registerComponent('XioLiftMES', () => App);
