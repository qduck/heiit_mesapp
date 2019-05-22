
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import Login from '../view/Login';
import Lists from '../view/Lists';
import IndexPage from '../viewbiz/IndexPage';
import WebViewPage from '../viewc/WebPageView';
import WorkListPage from '../viewbiz/WorkList';
import WorkMsgPage from '../viewbiz/WorkMsg';
import ReportPage from '../viewbiz/ReportPage';
import MinePage from '../viewbiz/MinePage';

// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const styles = StyleSheet.create({

});

const IndexDrawerItem = createBottomTabNavigator(
    {
        Home: {
            screen: IndexPage,
            navigationOptions: {
                tabBarLabel: '首页',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Icon
                        name='ios-home'
                        size={26}
                        type='ionicon'
                        color={tintColor}
                    />
                ),
            }
        },
        Work: {
            screen: WorkListPage,
            navigationOptions: {
                tabBarLabel: '工作',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Icon
                        name='ios-construct'
                        size={26}
                        type='ionicon'
                        color={tintColor}
                        onPress={() => navigation.openDrawer()}
                    />
                ),
            }
        },
        Message: {
            screen: WorkMsgPage,
            navigationOptions: {
                tabBarLabel: '消息',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Icon
                        name='ios-cloud'
                        size={26}
                        type='ionicon'
                        color={tintColor}
                    />
                ),
            }
        },
        APP: {
            screen: ReportPage,
            navigationOptions: {
                tabBarLabel: '报表',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Icon
                        name='ios-apps'
                        size={26}
                        type='ionicon'
                        color={tintColor}
                    />
                ),
            }
        },
        Mine: {
            screen: MinePage,
            navigationOptions: {
                tabBarLabel: '我的',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Icon
                        name='ios-contact'
                        size={26}
                        type='ionicon'
                        color={tintColor}
                    />
                ),
            }
        }
    },
    {
        tabBarOptions: {
            //当前选中的tab bar的文本颜色和图标颜色
            activeTintColor: '#0066ff',
            //当前未选中的tab bar的文本颜色和图标颜色
            inactiveTintColor: '#333',
            //是否显示tab bar的图标，默认是false
            showIcon: true,
            //showLabel - 是否显示tab bar的文本，默认是true
            showLabel: true,
            //是否将文本转换为大小，默认是true
            upperCaseLabel: false,
            //material design中的波纹颜色(仅支持Android >= 5.0)
            pressColor: '#788493',
            //按下tab bar时的不透明度(仅支持iOS和Android < 5.0).
            pressOpacity: 0.8,
            //tab bar的样式
            style: {
                backgroundColor: '#fff',
                paddingBottom: 1,
                borderTopWidth: 0.2,
                paddingTop: 1,
                borderTopColor: '#ccc',
            },
            //tab bar的文本样式
            labelStyle: {
                fontSize: 11,
                margin: 1
            },
            //tab 页指示符的样式 (tab页下面的一条线).
            indicatorStyle: { height: 0 },
        },
        //tab bar的位置, 可选值： 'top' or 'bottom'
        tabBarPosition: 'bottom',
        //是否允许滑动切换tab页
        swipeEnabled: true,
        //是否在切换tab页时使用动画
        animationEnabled: false,
        //是否懒加载
        lazy: true,
        //返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
        backBehavior: 'none',
    }
);

IndexDrawerItem.navigationOptions = {
    drawerLabel: '工厂首页',
    drawerIcon: ({ tintColor }) => (
        <Icon
            name="home"
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

export default IndexDrawerItem;