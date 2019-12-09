import React, { Component } from 'react';

import { StyleSheet, Text, View, Image, TextInput, Alert, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Header, Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card, WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { connect } from 'react-redux';

// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

class WorkList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //现场数据采集功能按钮
            appBtnes: [],
            //生产管理功能按钮
            appBtnPP: [],
            //仓储物料管理功能按钮
            appBtnMM: [],
            //质检管理功能按钮
            appBtnQC: [],
            //开发测试使用
            appBtnTest: [],
            //默认打开的结点
            activeSections: [0, 1, 2, 3],
        };
        this.onChange = activeSecVal => {

            this.setState({ activeSections: activeSecVal });
            // var index = activeSections.indexOf(activeSecVal);
            // if (index >= 0) {
            //     //存在
            //     activeSections.splice(index, 1);
            // } else {
            //     //不存在
            //     activeSections.push(activeSecVal);
            // }
            //this.setState({ activeSections });
        };


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
                this.state.appBtnMM.push(
                    {
                        name: '采购入库扫描',
                        iconname: 'ios-log-in',
                        pagepath: 'PoIn'
                    }
                )
                this.state.appBtnMM.push(
                    {
                        name: '仓库配送',
                        iconname: 'ios-open',
                        pagepath: 'PSDList'
                    }
                )
                this.state.appBtnMM.push(
                    {
                        name: '采购入库(按行)',
                        iconname: 'ios-log-in',
                        pagepath: 'PoinByLine'
                    }
                )
            }
            if (user.barRoleText.includes('装箱管理') == true) {
                this.state.appBtnes.push(
                    {
                        name: '工单完工扫描',
                        iconname: 'md-construct',
                        pagepath: 'WoClose'
                    }
                )

                this.state.appBtnes.push(
                    {
                        name: '装箱扫描',
                        iconname: 'logo-dropbox',
                        pagepath: 'WoBoxClose'
                    }
                )

                this.state.appBtnes.push(
                    {
                        name: '同步数据查询',
                        iconname: 'ios-cloud-upload',
                        pagepath: 'SyncManager'
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
            }
            ///====================>>>>>>>>>>>>>>>>>>>>QC管理

            if (user.barRoleText.includes('成品质检') == true) {
                this.state.appBtnQC.push(
                    {
                        name: '成品拼搭质检',
                        iconname: 'ios-checkbox',
                        pagepath: 'FQCPinDa'
                    }
                )
                this.state.appBtnQC.push(
                    {
                        name: '成品联动质检',
                        iconname: 'md-git-network',
                        pagepath: 'FQCLianDong'
                    }
                )

                this.state.appBtnQC.push(
                    {
                        name: '拼搭不合格处理',
                        iconname: 'md-transgender',
                        pagepath: 'FQCPinDaHandle'
                    }
                )
                this.state.appBtnQC.push(
                    {
                        name: '联动不合格处理',
                        iconname: 'md-transgender',
                        pagepath: 'FQCLianDongHandle'
                    }
                )
            }
            ///====================>>>>>>>>>>>>>>>>>>>>IQC管理

            if (user.barRoleText.includes('进货质检') == true || user.loginName == 'admin') {
                this.state.appBtnQC.push(
                    {
                        name: '进货质检',
                        iconname: 'md-checkbox-outline',
                        pagepath: 'IQCCheck'
                    }
                )
            }
            ///====================>>>>>>>>>>>>>>>>>>>>开发测试
            if (user.loginName == 'admin') {
                this.state.appBtnTest.push(
                    {
                        name: 'NFC_M1TEST',
                        iconname: 'md-code-working',
                        pagepath: 'NFCMifareTest'
                    }
                );
                this.state.appBtnTest.push(
                    {
                        name: 'NFC_NdefTEST',
                        iconname: 'md-code-working',
                        pagepath: 'NFCMultiNdefRecord'
                    }
                );

                this.state.appBtnTest.push(
                    {
                        name: '音频操作测试',
                        iconname: 'md-code-working',
                        pagepath: 'AudioTest'
                    }
                );

                this.state.appBtnTest.push(
                    {
                        name: '消息推送',
                        iconname: 'md-code-working',
                        pagepath: 'JPushMessageTest'
                    }
                );

                this.state.appBtnTest.push(
                    {
                        name: 'AR&VR 测试',
                        iconname: 'md-code-working',
                        pagepath: 'ARVR_TEST'
                    }
                );
            }

        }
    }


    renderAppBtn(btnitem, index) {
        return (
            <TouchableOpacity key={btnitem.pagepath} onPress={this.NaviTo.bind(this, btnitem.pagepath)}>
                <View style={styles.appBtn}>
                    <Icon
                        reverse
                        name={btnitem.iconname}
                        type='Ionicons'
                        color='#0033cc'
                        size={48}
                    />
                    <Text style={{ fontSize: 10 }}>{btnitem.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    showAppFunc(title, applist) {
        if (applist && applist.length >= 1) {
            return (
                <View>
                    <Card full >
                        <Card.Header
                            title={title}
                        />
                        <Card.Body>
                            <Flex wrap="wrap">
                                {
                                    applist.map((item, index) => {
                                        return this.renderAppBtn(item, index)
                                    })
                                }
                            </Flex>
                        </Card.Body>
                    </Card>
                    <WhiteSpace size='xs' />
                </View>
            )
        } else {
            return;
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;

        //Alert.alert(user.barRoleText);
        return (
            <ScrollView  >
                <WhiteSpace size='xs' />
                {this.showAppFunc("仓储物料管理", this.state.appBtnMM)}

                {this.showAppFunc("车间现场管理", this.state.appBtnes)}

                {this.showAppFunc("生产管理", this.state.appBtnPP)}

                {this.showAppFunc("质检管理", this.state.appBtnQC)}

                {this.showAppFunc("测试功能", this.state.appBtnTest)}
            </ScrollView>
        );

    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
    })
)(WorkList)

const styles = StyleSheet.create({
    container: {

    },
    applist: {

    },
    appBtn: {
        // justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 100,
        padding: 10,
        borderColor: '#fff',
        overflow: 'hidden',
    }
});
