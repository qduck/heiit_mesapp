import React, { Component } from 'react'
import { Text, StyleSheet, View, Button, Platform } from 'react-native'
import JPushModule from 'jpush-react-native'

export default class ChatWith extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        //极光推送
        JPushModule.initPush();// 初始化 JPush
        // 新版本必需写回调函数
        // JPushModule.notifyJSDidLoad();
        JPushModule.notifyJSDidLoad((resultCode) => {
            if (resultCode === 0) {
                console.log(resultCode);
            }
        });


        // 接收自定义消息
        JPushModule.addReceiveCustomMsgListener((message) => {
            console.log("接收自定义消息: " + message);
            //this.setState({ pushMsg: message });
        });
        // 接收推送通知
        JPushModule.addReceiveNotificationListener((message) => {
            console.log("接收推送通知: " + message);
        });
        // 打开通知
        JPushModule.addReceiveOpenNotificationListener((map) => {
            console.log("Opening notification!");
            console.log("map.extra: " + map.extras);
            // 可执行跳转操作，也可跳转原生页面
            // this.props.navigation.navigate("SecondActivity");
        });
    }

    componentWillUnmount() {
        // JPushModule.removeReceiveCustomMsgListener();
        // JPushModule.removeReceiveNotificationListener();
    }

    render() {
        return (
            <View style={styles.containers}>
                <Button
                    title="点击推送"
                    onPress={() => {
                        // 推送事件 业务代码 请提取到函数里面    
                        JPushModule.sendLocalNotification({
                            buildId: 1, // 设置通知样式
                            id: 5, // 通知的 id, 可用于取消通知
                            extra: { key1: 'value1', key2: 'value2' }, // extra 字段 就是我们需要传递的参数
                            fireTime: new Date().getTime(), // 通知触发时间的时间戳（毫秒）
                            badge: 8, // 本地推送触发后应用角标的 badge 值 （iOS Only）
                            subtitle: 'subtitle',  // 子标题 （iOS10+ Only）
                            title: '通知',
                            content: '您有未读消息',
                        })
                    }}
                />

                <Text>
                </Text>
                <Button
                    title="点击测试全局异常信息获取"
                    onPress={() => {
                        // 推送事件 业务代码 请提取到函数里面    
                        this.texterror()
                    }}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containers: {
        paddingTop: 20
    }
})