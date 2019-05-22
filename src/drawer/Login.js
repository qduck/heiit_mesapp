
import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
// import { Alert } from 'react-native';

import Login from '../view/Login';
import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const LoginDrawerItem = createStackNavigator(
    {
        Playground: {
            path: '/Login',
            screen: Login
        }
    },
    {
        headerMode: 'none'
    }
);

LoginDrawerItem.navigationOptions = {
    drawerLabel: '登录',
    drawerIcon: ({ tintColor }) => (
        <Icon
            name="mail"
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

export default LoginDrawerItem;