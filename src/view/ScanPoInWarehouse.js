import React from 'react';
import { TextInput, Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Input, FormValidationMessage, Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { HTTPPOST } from '../api/HttpRequest';

import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


class ScanPoInWarehouse extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pono: '',
            pono_valid: true,
            pono_emessage: '',
            pono_focused: true,
            submitLoading: false,


        };
        //const navigate = this.props.navigation;
        //this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
        //  this.checkpono = this.checkpono.bind(this);
    }
    _keyboardWillShow() {
        //Keyboard.dismiss();
    }

    checkpono(val) {
        this.setState({ pono: val });
    }

    //提交扫描结果
    async submitForm() {

        let { status, user, token } = this.props;

        let data = {
            code: user.code,
            orderNo: this.state.pono
        }

        if (this.state.pono == '') {
            Alert.alert('错误！', '请扫描订单条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
            return;
        }
        this.setState({ submitLoading: true });

        HTTPPOST('/sm/execSSSM', data, token)
            .then((res) => {
                if (res.code == 1) {
                    this.refs.toast.show('订单【' + data.orderNo + '】入库成功，继续下一个订单！');
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                    // this.refs.textInput1.value = '';

                } else {
                    Alert.alert('错误', '订单[' + data.orderNo + ']' + res.msg);
                }

                this.setState({ submitLoading: false });

                this.refs.textInput1.focus();
                //Keyboard.dismiss();
                //_HTTPPOST = null;
            }).catch((error) => {
                Alert.alert('错误', error);

                this.setState({ submitLoading: false });
                //this.setState({ pono: '' });
                //_HTTPPOST = null;
                this.refs.textInput1.focus();
                //Keyboard.dismiss();
            });

        this.refs.textInput1.focus();
        //Keyboard.dismiss();
    }

    // showCamera() {
    //     const { navigate } = this.props.navigation;
    //     navigate('ScannerCode',
    //         {
    //             callback: (backData) => {
    //                 this.setState({
    //                     pono: backData
    //                 });
    //             }
    //         })
    // }

    async componentDidMount() {

        await InteractionManager.runAfterInteractions();
        this.props.navigation.navigate('DrawerClose');
    }
    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        let { status } = this.props;
        const { navigate } = this.props.navigation;
        if (status != '1') {
            navigate('Login');
        }
    }
    componentWillUnmount() {

    }

    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }


    render() {
        return (
            <ScrollView>
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '采购单入库扫描', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>
                    <WhiteSpace />
                    <WhiteSpace />
                    <View style={styles.textIconInput}>
                        {/* <FormInput ref="textInput1"
                        type="text" value={this.state.pono}
                        onChangeText={this.checkpono}
                        onSubmitEditing={this.submitForm.bind(this)}
                        autoFocus={this.state.pono_focused}
                        style={styles.inputS}
                        width={SCREEN_WIDTH - 70}
                        keyboardType="email-address"
                    /> */}
                        <Input label="采购订单号：" type="text"
                            selectTextOnFocus={true}
                            ref="textInput1"
                            onSubmitEditing={this.submitForm.bind(this)}
                            onChangeText={(text) => this.setState({ pono: text })}
                            autoFocus={this.state.pono_focused}
                            value={this.state.pono}
                            errorMessage={this.state.pono_emessage}
                        />

                    </View>
                    <WhiteSpace />
                    <WhiteSpace />

                    <View>
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='确认并入库' />
                    </View>



                </WingBlank>
                <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />

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
)(ScanPoInWarehouse)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        justifyContent: 'flex-start',
    },
    headercontainer: {
        marginTop: 0,
        paddingTop: 0,
        height: 50,

    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        paddingRight: 0, marginRight: 0, marginLeft: 20
    }
});