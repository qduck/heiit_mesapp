
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import Login from '../view/Login';
import PPLists from '../viewpp/ProductList';
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
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const styles = StyleSheet.create({

});

const QCListDrawerItem = createStackNavigator(
    {
        QCList: {
            path: '/QCList',
            screen: PPLists,
            navigationOptions: ({ navigation }) => ({
                title: '质检管理',
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
                        iconStyle={{ paddingLeft: 10, paddingTop: 8, color: '#fff' }}
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
                        iconStyle={{ paddingLeft: 10, paddingTop: 8, color: '#fff' }}
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
                        iconStyle={{ paddingLeft: 10, paddingTop: 8, color: '#fff' }}
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
                        iconStyle={{ paddingLeft: 10, paddingTop: 8, color: '#fff' }}
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

QCListDrawerItem.navigationOptions = {
    drawerLabel: '质检管理',
    drawerIcon: ({ tintColor }) => (
        <Icon
            name="playlist-add-check"
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

export default QCListDrawerItem;