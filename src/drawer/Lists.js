
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import Login from '../view/Login';
import Lists from '../view/Lists';
import Index from './Index';
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
import FQCPinDaScreen from '../viewbiz/qc/FQCPinDa';
import FQCLianDongScreen from '../viewbiz/qc/FQCLianDong';
import FQCPinDaHandleScreen from '../viewbiz/qc/FQCPinDaHandle';
import FQCLianDongHandleScreen from '../viewbiz/qc/FQCLianDongHandle';

import AudioTestScreen from '../viewbiz/test/AudioTest';
import JPushMessageTestScreen from '../viewbiz/test/JPushMessageTest';


// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const styles = StyleSheet.create({

});

const ListsDrawerItem = createStackNavigator(
    {
        Index: {
            screen: Index,
        },
        PoIn: {
            path: '/PoIn',
            screen: ScanPoInWarehouse,
        },
        WoBoxClose: {
            path: '/WoBoxClose',
            screen: ScanWoBoxClose,
        },
        BoxInStorage: {
            path: '/BoxInStorage',
            screen: ScanBoxInStorage,
        },
        BoxShipping: {
            path: '/BoxShipping',
            screen: ScanBoxShipping,
        },
        EMDayCheck: {
            path: '/EMDayCheck',
            screen: EMDayCheckScreen,
        },
        //配送单扫描
        PSDScan: {
            path: '/PSDScan',
            screen: PSDScanScreen,
        },
        //仓库配送业务
        PSDList: {
            path: '/PSDList',
            screen: PSDListScreen,
        },
        //数据同步管理
        SyncManager: {
            path: '/SyncManager',
            screen: SyncMangerScreen,
        },
        //装配工单扫描
        WoClose: {
            path: '/WoClose',
            screen: ScanWoClose,
        },
        //成品检验拼搭
        FQCPinDa: {
            path: '/FQCPinDa',
            screen: FQCPinDaScreen,
        },
        //成品检验联动
        FQCLianDong: {
            path: '/FQCLianDong',
            screen: FQCLianDongScreen,
        },
        //成品检验联动
        FQCPinDaHandle: {
            path: '/FQCPinDaHandle',
            screen: FQCPinDaHandleScreen,
        },
        FQCLianDongHandle: {
            path: '/FQCLianDongHandle',
            screen: FQCLianDongHandleScreen,
        },
        //下面是通用的业务功能===========================================================================>>
        ScannerCode: {
            path: '/ScannerCode',
            screen: ScannerCodeScreen,
        },
        TakePhoto: {
            path: '/TakePhoto',
            screen: TakePhotoScreen,
        },
        //下面是开发测试的功能===========================================================================>>
        NFCMifareTest: {
            path: '/NFCMifareTest',
            screen: NFCMifareTestScreen,
        },
        NFCMultiNdefRecord: {
            path: '/NFCMultiNdefRecord',
            screen: NFCMultiNdefRecordScreen,
        },
        AudioTest: {
            path: '/AudioTest',
            screen: AudioTestScreen,
        }
        ,
        JPushMessageTest: {
            path: '/JPushMessageTest',
            screen: JPushMessageTestScreen,
        }
    },
    {
        headerMode: 'none'
    }
);

ListsDrawerItem.navigationOptions = {
    drawerLabel: '工作中心',
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