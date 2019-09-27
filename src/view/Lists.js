import React, { Component } from 'react';

import { StyleSheet, Text, View, Image, TextInput, Alert, Animated } from 'react-native';
import { Button, Header, Card, Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

class Lists extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            appBtnes: [

            ]
        }


    }

    //跳转到详情页面
    NaviTo(name) {
        const { navigate } = this.props.navigation;
        navigate(name)
    }


    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;
        navigate('DrawerClose');

        if (status != '1') {
            navigate('Login');
        }

        if (user && user.barRoleText) {
            if (user.barRoleText.includes('采购到货') == true) {
                this.state.appBtnes.push(
                    {
                        name: '采购入库扫描',
                        iconname: 'ios-log-in',
                        pagepath: 'PoIn'
                    }
                )
            }
            if (user.barRoleText.includes('装箱管理') == true) {
                this.state.appBtnes.push(
                    {
                        name: '装箱扫描',
                        iconname: 'logo-dropbox',
                        pagepath: 'WoBoxClose'
                    }
                )
            }
            if (user.barRoleText.includes('入库管理') == true) {
                this.state.appBtnes.push(
                    {
                        name: '成品入库扫描',
                        iconname: 'md-archive',
                        pagepath: 'BoxInStorage'
                    }
                )
            }
            if (user.barRoleText.includes('发运管理') == true) {
                this.state.appBtnes.push(
                    {
                        name: '发运扫描',
                        iconname: 'ios-send',
                        pagepath: 'BoxShipping'
                    }
                )
            }
            if (user.barRoleText.includes('配送单确认') == true) {
                this.state.appBtnes.push(
                    {
                        name: '配送单接收',
                        iconname: 'ios-cart',
                        pagepath: 'PSDScan'
                    }
                )

                this.state.appBtnes.push(
                    {
                        name: '仓库配送',
                        iconname: 'ios-open',
                        pagepath: 'PSDList'
                    }
                )
            }
        }

        this.state.appBtnes.push(
            {
                name: '日保养扫描',
                iconname: 'ios-construct',
                pagepath: 'EMDayCheck'
            }
        )
        //同步数据
        this.state.appBtnes.push(
            {
                name: '同步数据管理(测试)',
                iconname: 'ios-more',
                pagepath: 'SyncManager'
            }
        )

        //TEST
        this.state.appBtnes.push(
            {
                name: 'NFC M1卡功能测试',
                iconname: 'ios-more',
                pagepath: 'NFCMifareTest'
            }
        )
        this.state.appBtnes.push(
            {
                name: 'NFC Ndef记录测试',
                iconname: 'ios-more',
                pagepath: 'NFCMultiNdefRecord'
            }
        )

    }

    render() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;

        //Alert.alert(user.barRoleText);
        return (
            <View style={styles.container}>

                <View style={styles.applist}>
                    {
                        this.state.appBtnes.map((item, index) => {
                            return <View style={styles.appBtn} key={index}>
                                <Icon
                                    reverse
                                    name={item.iconname}
                                    type='Ionicons'
                                    color='#0033cc'
                                    size={48}
                                    onPress={this.NaviTo.bind(this, item.pagepath)}
                                />
                                <Text style={{ fontSize: 10 }}>{item.name}</Text>
                            </View>
                        })
                    }

                </View>




            </View>
        );



    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
    })
)(Lists)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fefefe',
        justifyContent: 'flex-start'
    },
    applist: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    appBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 100,
        padding: 10,
        borderColor: '#fff',
    }
});
