/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View, Image, Dimensions, YellowBox,
  Alert
} from 'react-native';
import { Provider } from 'react-redux';
import { createDrawerNavigator, DrawerItems } from 'react-navigation';

import configureStore from './src/store/ConfigureStore';

import Login from './src/drawer/Login';
import Lists from './src/drawer/Lists';
import Indexs from './src/drawer/Index';
import PPList from './src/drawer/PPList';
import MMList from './src/drawer/MMList';
import QCList from './src/drawer/QCList';
import codePush from "react-native-code-push";
import Config from 'react-native-config';
import { getAllExternalFilesDirs } from 'react-native-fs';

const SCREEN_WIDTH = Dimensions.get('window').width;
const store = configureStore();

const CustomDrawerContentComponent = props => (
  <View style={{ flex: 1, backgroundColor: '#43484d' }}>
    <View style={{ marginLeft: 10 }}>
      <DrawerItems {...props} />
    </View>
  </View>
);

//Route Config
const MainRoot = createDrawerNavigator(
  {
    Login: {
      path: '/login',
      screen: Login,
    },
    Index: {
      path: '/index',
      screen: Indexs,
    },
    Lists: {
      path: '/lists',
      screen: Lists,
    },
    PPList: {
      path: '/PPList',
      screen: PPList,
    },
    MMList: {
      path: '/MMList',
      screen: MMList,
    },
    QCList: {
      path: '/QCList',
      screen: QCList,
    }
  },
  {
    initialRouteName: 'Login',
    contentOptions: {
      activeTintColor: '#548ff7',
      activeBackgroundColor: 'transparent',
      inactiveTintColor: '#ffffff',
      inactiveBackgroundColor: 'transparent',
      labelStyle: {
        fontSize: 15,
        marginLeft: 0,
      }
    },
    drawerWidth: SCREEN_WIDTH * 0.8,
    contentComponent: CustomDrawerContentComponent,
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
  }
);
// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });

// const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

export default class App extends Component {
  //deploymentKey为刚才生成的,打包哪个平台的App就使用哪个Key
  componentDidMount() {
    this.checkAppUpdate();
  }

  //检查程序更新
  checkAppUpdate() {
    let deploymentKey = Config.Code_Push_deploymentKey;
    codePush.checkForUpdate(deploymentKey).then((update) => {
      if (!update) {
        console.log("已是最新版本");
      } else {
        codePush.sync({
          deploymentKey: deploymentKey,
          updateDialog: {
            optionalIgnoreButtonLabel: '稍后',
            optionalInstallButtonLabel: '立即更新',
            optionalUpdateMessage: '有新版本了，是否更新？',
            title: '更新提示'
          },
          installMode: codePush.InstallMode.IMMEDIATE,
        },
          (status) => {
            switch (status) {
              case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                console.log("DOWNLOADING_PACKAGE");
                break;
              case codePush.SyncStatus.INSTALLING_UPDATE:
                console.log(" INSTALLING_UPDATE");
                Alert.alert("程序更新完成，欢迎继续使用本系统！");
                break;
            }
          },
          (progress) => {
            console.log(progress.receivedBytes + " of " + progress.totalBytes + " received.");
          }
        );
      }
    }).catch()
  }

  render() {
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
    return (
      <Provider store={store}>
        <MainRoot />
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
