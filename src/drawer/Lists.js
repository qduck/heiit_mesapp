
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import Login from '../view/Login';
import Lists from '../view/Lists';
import ScanPoInWarehouse from '../view/ScanPoInWarehouse';
import ScannerCodeScreen from '../viewc/ScannerCodeScreen';
import TakePhotoScreen from '../viewc/TakePhotoScreen';
import ScanWoBoxClose from '../view/ScanWoBoxClose';
import ScanBoxInStorage from '../view/ScanBoxInStorage';
import ScanBoxShipping from '../view/ScanBoxShipping';
import EMDayCheckScreen from '../view/EMDayCheck';
import SyncMangerScreen from '../view/SyncManger';
import NFCMifareTestScreen from '../view/NFCMifareTest';
import NFCMultiNdefRecordScreen from '../view/NFCMultiNdefRecord';
import PSDScanScreen from '../view/ScanMaterialDistribution';
import PSDListScreen from '../viewbiz/PSDList';
import ScanWoClose from '../viewbiz/pp/WoClose';
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const styles = StyleSheet.create({

});

const ListsDrawerItem = createStackNavigator(
    {
        AppList: {
            path: '/AppList',
            screen: Lists,
            navigationOptions: ({ navigation }) => ({
                title: '数据采集中心',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="menu"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.openDrawer()}
                    />
                ),
                headerRight: (
                    <Icon
                        name="home"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
            }),
        },
        PoIn: {
            path: '/PoIn',
            screen: ScanPoInWarehouse,
            navigationOptions: ({ navigation }) => ({
                title: '采购入库（散件）',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        WoBoxClose: {
            path: '/WoBoxClose',
            screen: ScanWoBoxClose,
            navigationOptions: ({ navigation }) => ({
                title: '装箱管理（车间）',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        BoxInStorage: {
            path: '/BoxInStorage',
            screen: ScanBoxInStorage,
            navigationOptions: ({ navigation }) => ({
                title: '成品入库扫描',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        BoxShipping: {
            path: '/BoxShipping',
            screen: ScanBoxShipping,
            navigationOptions: ({ navigation }) => ({
                title: '发运扫描',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        EMDayCheck: {
            path: '/EMDayCheck',
            screen: EMDayCheckScreen,
            navigationOptions: ({ navigation }) => ({
                title: '保养-日巡检',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //配送单扫描
        PSDScan: {
            path: '/PSDScan',
            screen: PSDScanScreen,
            navigationOptions: ({ navigation }) => ({
                title: '物料配送签收扫描',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //仓库配送业务
        PSDList: {
            path: '/PSDList',
            screen: PSDListScreen,
            navigationOptions: ({ navigation }) => ({
                title: '仓库物料配送',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //数据同步管理
        SyncManager: {
            path: '/SyncManager',
            screen: SyncMangerScreen,
            navigationOptions: ({ navigation }) => ({
                title: '同步数据管理',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //装配工单扫描
        WoClose: {
            path: '/WoClose',
            screen: ScanWoClose,
            navigationOptions: ({ navigation }) => ({
                title: '装配工单扫描',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //下面是通用的业务功能===========================================================================>>
        ScannerCode: {
            path: '/ScannerCode',
            screen: ScannerCodeScreen,
            navigationOptions: ({ navigation }) => ({
                title: '条码扫描',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#000',
                    height: 30,
                    paddingTop: 8,
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        TakePhoto: {
            path: '/TakePhoto',
            screen: TakePhotoScreen,
            navigationOptions: ({ navigation }) => ({
                title: '拍摄照片',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#000',
                    height: 30,
                    paddingTop: 8,
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        //下面是开发测试的功能===========================================================================>>
        NFCMifareTest: {
            path: '/NFCMifareTest',
            screen: NFCMifareTestScreen,
            navigationOptions: ({ navigation }) => ({
                title: 'NFC Mifare 测试',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        },
        NFCMultiNdefRecord: {
            path: '/NFCMultiNdefRecord',
            screen: NFCMultiNdefRecordScreen,
            navigationOptions: ({ navigation }) => ({
                title: 'NFC Ndef 测试',
                headerMode: 'screen',
                headerStyle: {
                    backgroundColor: '#0033cc',
                },
                headerTintColor: '#fff',
                headerLeft: (
                    <Icon
                        name="chevron-left"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingLeft: 10, color: '#fff' }}
                        onPress={() => navigation.navigate('Index')}
                    />
                ),
                headerRight: (
                    <Icon
                        name="chevron-up"
                        size={30}
                        type="entypo"
                        iconStyle={{ paddingRight: 10, color: '#fff' }}
                        onPress={() => navigation.goBack()}
                    />
                ),
            }),
        }

    },
    {
        headerMode: 'screen'
    }
);

ListsDrawerItem.navigationOptions = {
    drawerLabel: '数据采集中心',
    drawerIcon: ({ tintColor }) => (
        <Icon
            name="looks"
            size={30}
            iconStyle={{
                width: 30,
                height: 30
            }}
            type="material"
            color={tintColor}
        />
    ),
};

export default ListsDrawerItem;