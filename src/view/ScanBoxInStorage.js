import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid } from 'react-native';
import { Input, Button, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST } from '../api/HttpRequest';
import { connect } from 'react-redux';

// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


class ScanBoxInStorage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            boxno: '',
            boxno_valid: true,
            boxno_emessage: '',
            boxno_focused: true,
            submitLoading: false
        };
        //const navigate = this.props.navigation;

        this.checkboxno = this.checkboxno.bind(this);
    }

    checkboxno(val) {
        this.setState({ boxno: val });
    }

    //提交扫描结果
    submitForm() {

        let { status, user, token } = this.props;

        let data = {
            code: user.code,
            packBarCode: this.state.boxno
        }

        if (this.state.boxno == '') {
            Alert.alert('错误！', '请扫描箱子唛头条码。');
            return;
        }
        HTTPPOST('/sm/execRKSM', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    let retmsg = res.msg;
                    if (res.data && res.data.msg) {
                        retmsg = retmsg + res.data.msg
                    }
                    ToastAndroid.show(
                        '【' + this.state.boxno + '】' + retmsg + '，继续下一箱入库！',
                        ToastAndroid.LONG
                    );
                    //this.setState({ boxno: '' });
                    //this.setState({ boxno_focused: true });
                    this.refs.textInput1.focus();
                } else {
                    Alert.alert('错误', res.code + ':' + res.msg);
                    this.refs.textInput1.focus();
                }
                //this.setState({ submitLoading: false });
            }).catch((error) => {
                Alert.alert('异常', error);
                this.refs.textInput1.focus();
                //this.setState({ submitLoading: false });
            });

    }

    showCamera() {
        const { navigate } = this.props.navigation;
        navigate('ScannerCode',
            {
                callback: (backData) => {
                    this.setState({
                        boxno: backData
                    });
                }
            })
    }
    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        let { status } = this.props;
        const { navigate } = this.props.navigation;
        if (status != '1') {
            navigate('Login');
        }
    }
    render() {
        this.props.navigation.navigate('DrawerClose');

        return (
            <ScrollView >
                <WingBlank>
                    <WhiteSpace />
                    <View style={styles.textIconInput}>
                        <Input ref="textInput1"
                            label="箱子唛头码："
                            selectTextOnFocus={true}
                            type="text" value={this.state.boxno}
                            onChangeText={this.checkboxno}
                            onSubmitEditing={this.submitForm.bind(this)}
                            autoFocus={this.state.boxno_focused}
                            style={styles.inputS}
                            keyboardType="email-address"
                            errorMessage={this.state.boxno_emessage}
                        />
                    </View>
                    <WhiteSpace /><WhiteSpace /><View>
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='确认入库' />
                        {/* <Button backgroundColor='#6495ed' activeOpacity={1}
                        onPress={this.showCamera.bind(this)}
                        title='测试摄像头' /> */}
                    </View>
                </WingBlank>
            </ScrollView>
        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token
    })
)(ScanBoxInStorage)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        justifyContent: 'flex-start',
    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        paddingRight: 0, marginRight: 0,
    }
});