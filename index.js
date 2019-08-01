import { AppRegistry, Alert } from 'react-native';
import App from './App';
import ErrorUtils from "ErrorUtils";
import { LogInfo, LogException } from './src/api/Logger';
// import applyDecoratedDescriptor from '@babel/runtime/helpers/esm/applyDecoratedDescriptor'
// import initializerDefineProperty from '@babel/runtime/helpers/esm/initializerDefineProperty'


// Object.assign(babelHelpers, {
//     applyDecoratedDescriptor,
//     initializerDefineProperty,
// });

ErrorUtils.setGlobalHandler((e) => {

    //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
    //Alert.alert("异常", JSON.stringify(e))

    LogException('全局异常', JSON.stringify(error.message) + JSON.stringify(error.stack));
    console.log(e);
});

AppRegistry.registerComponent('XioLiftMES', () => App);
