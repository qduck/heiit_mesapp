import React, { Component } from 'react';

import { StyleSheet, ScrollView, Text, View, Image, TextInput, Alert, YellowBox, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
//import { HTTPPOST } from '../api/HttpRequest'
import { connect } from 'react-redux';
import * as loginAction from '../store/actions/Login'
import Config from 'react-native-config';
import NfcManager, { Ndef } from 'react-native-nfc-manager';
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const Logo_IMAGE = require('../../assets/images/logo.png');

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: Config.User_Name, //测试账号
            username_valid: true,
            username_emessage: '',
            password: Config.User_Password,  //测试密码
            password_emessage: '',
            step: 1, //步骤1：填写表单；步骤2：登陆过程
            //下面是NFC相关的属性
            supported: true,
            enabled: false,
            tag: {},
            parsed: null,
        };

        this.checkusername = this.checkusername.bind(this);
        this.checkpassword = this.checkpassword.bind(this);
    }

    checkusername(val) {
        this.setState({ step: 1 });
        this.setState({ username: val });
        var uPattern = /^[a-zA-Z0-9_-]{3,18}$/;
        if (uPattern.test(val) == false) {
            this.setState({ username_emessage: '用户名有误,3-18位（字母，数字，下划线，减号）' });
        } else {
            this.setState({ username_emessage: '' });
        }

    }

    checkpassword(val) {
        this.setState({ step: 1 });
        this.setState({ password: val });
    }

    //系统登陆处理
    submitLogin() {
        //TEST CODE
        this.setState({ step: 2 });
        this.props.dispatch(loginAction.login({
            username: this.state.username,
            password: this.state.password,
        }));

    }

    componentDidMount() {
        this.setState({ tag: null });
        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    this._startNfc();
                }
            })
    }

    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({ supported: false });
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    this.setState({ enabled });
                })
                .catch(err => {
                    console.log(err);
                })

            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        this.setState({ enabled: true });
                    } else if (event.state === 'off') {
                        this.setState({ enabled: false });
                    } else if (event.state === 'turning_on') {
                        // do whatever you want
                    } else if (event.state === 'turning_off') {
                        // do whatever you want
                    }
                }
            )
                .then(sub => {
                    this._stateChangedSubscription = sub;
                    // remember to call this._stateChangedSubscription.remove()
                    // when you don't want to listen to this anymore
                })
                .catch(err => {
                    console.warn(err);
                })
        }
    }

    //在组件完成更新后立即调用。在初始化时不会被调用
    componentDidUpdate() {
        let { status } = this.props;
        if (status == '1' && this.state.step == 2) {
            this.props.navigation.navigate('Index');
        }
    }

    componentWillUnmount() {
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }
    }

    render() {
        //this.props.navigation.navigate('DrawerClose');
        let { status, message, user } = this.props;

        let submitLoading = false;

        if (status == '1' && this.state.step == 2) {
            submitLoading = false;

        } else if (status == '0' && this.state.step == 2) {
            submitLoading = false;
            Alert.alert('登陆失败！', message);
        } else if (status == '123') {
            submitLoading = true;
        }
        let { tag } = this.state;

        return (

            <ScrollView>
                <WingBlank>
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <Flex justify="center">
                        <Image style={styles.logo} source={Logo_IMAGE} />
                        <Text style={styles.systemname}>MES系统</Text>
                    </Flex>

                    <WingBlank>
                        <WhiteSpace />
                        <WhiteSpace />
                        <WhiteSpace />
                        <WhiteSpace />
                        <Input
                            label="用户名："
                            value={this.state.username}
                            onChangeText={this.checkusername}

                            errorMessage={this.state.username_emessage}
                        />
                        <WhiteSpace />
                        <WhiteSpace />

                        <Input label="密码："
                            type="text"
                            secureTextEntry={true}
                            value={this.state.password}
                            onChangeText={this.checkpassword}
                            errorMessage={this.state.password_emessage}
                        />

                        <WhiteSpace />
                        <WhiteSpace />
                        <WhiteSpace />
                        <WhiteSpace />
                    </WingBlank>
                    <WingBlank>

                        <Button
                            onPress={this.submitLogin.bind(this)}
                            loading={submitLoading} title="登   录 （支持员工卡识别进入）" />
                        <Text>{tag ? '识别到卡：' + tag.id + '' : ''}</Text>
                    </WingBlank>
                    <View style={styles.copyright}>
                        <Text>copyright: XioLift IT V{Config.Version}</Text>
                    </View>
                </WingBlank>
            </ScrollView>
        );
    }
}



export default connect(//将页面与store内的state、action关联在一起，实现视图部分与逻辑处理部分的关联
    (state) => ({
        status: state.loginIn.status,
        message: state.loginIn.message,
        user: state.loginIn.user
    })
)(Login)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 80,
        justifyContent: 'flex-start'
    },
    logo: {
        width: 150,
        height: 60,
    },
    systemname: {
        fontSize: 24,
        marginLeft: 10,
    },
    copyright: {
        paddingTop: 20,

        width: SCREEN_WIDTH,

        alignItems: 'center'
    }
});



