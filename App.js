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
  View, Image, Dimensions, YellowBox, Modal,
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
import SQLite from './src/api/SQLite';
import { LogInfo, LogException } from './src/api/Logger';
import BackgroundJob from "react-native-background-job";

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
    // PPList: {
    //   path: '/PPList',
    //   screen: PPList,
    // },
    // MMList: {
    //   path: '/MMList',
    //   screen: MMList,
    // },
    // QCList: {
    //   path: '/QCList',
    //   screen: QCList,
    // }
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
  state = {
    modalVisible: false,
    downloadProgess: 0
  }
  //deploymentKey为刚才生成的,打包哪个平台的App就使用哪个Key
  componentDidMount() {
    if (Config.ENV == 'production') {
      this.checkAppUpdate();
    }
    //清空缓存数据
    var sqLite = new SQLite();
    sqLite.clean_DBData();
    //暂时停用此功能，在局域网内比较麻烦

    BackgroundJob.cancelAll();
    LogInfo('后台任务被清除！', '');
  }

  //检查程序更新
  checkAppUpdate() {
    let deploymentKey = Config.Code_Push_deploymentKey;
    codePush.checkForUpdate(deploymentKey).then((update) => {
      if (!update) {
        console.log("已是最新版本");
        this.setState({ modalVisible: false });
      } else {
        codePush.sync({
          deploymentKey: deploymentKey,
          updateDialog: {
            appendReleaseDescription: true,
            descriptionPrefix: "\n\n更新說明:\n",
            mandatoryContinueButtonLabel: "立即更新",
            mandatoryUpdateMessage: "发现重要更新,必須更新后才能使用!",
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
                //console.log("DOWNLOADING_PACKAGE");
                this.setState({ modalVisible: true });
                break;
              case codePush.SyncStatus.INSTALING_UPDATE:
                //console.log("INSTALLING_UPDALTE");
                this.setState({ modalVisible: false });
                //codePush.allowRestart();
                //Alert.alert("程序更新完成，欢迎继续使用本系统！");
                break;
              case codePush.SyncStatus.UP_TO_DATE:
                this.setState({ modalVisible: false });
                // console.warn("Installing uptodate.");
                break;
              case codePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({ modalVisible: false });
                // console.warn("Update installed.");
                break;
            }
          },
          (progress) => {
            let receivedBytes = progress.receivedBytes;
            let totalBytes = progress.totalBytes;
            let downloadProgess = (receivedBytes / totalBytes).toFixed(2);
            this.setState({ downloadProgess: downloadProgess });
            //console.log(progress.receivedBytes + " of " + progress.totalBytes + " received.");
          }
        );
      }
    }).catch((error) => {
      LogException('程序更新异常！' + error);
      return;
    })
  }

  render() {
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader', 'Warning:', 'Switch:']);
    let { modalVisible, downloadProgess } = this.state;
    let percentProgess = String(parseInt(downloadProgess * 100)) + '%';
    return (
      <View style={{ flex: 1 }}>
        <Provider store={store}>
          <MainRoot />
        </Provider>
        <Modal
          visible={modalVisible}
          animated={'slide'}
          transparent={true}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: SCREEN_WIDTH * 0.6, height: 20, borderRadius: 10, backgroundColor: '#e5e5e5' }}>
                  <View style={{ width: SCREEN_WIDTH * 0.6 * downloadProgess, height: 20, borderRadius: 10, backgroundColor: '#ff6952' }}></View>
                </View>
                <Text style={{ color: '#fff', marginLeft: 10, fontSize: 14 }}>{percentProgess}</Text>
              </View>
              <Text style={{ color: '#fff', marginTop: 12 }}>{downloadProgess < 1 ? '正在下载更新资源包,请稍候。。。' : '下载完成,应用即將重启'}</Text>
            </View>
          </View>
        </Modal>
      </View>
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
