import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager } from 'react-native';
import { Input, Button, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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


class ScanMaterialDistribution extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pono: '',
            pono_valid: true,
            pono_emessage: '',
            pono_focused: true,
            submitLoading: false
        };
        //const navigate = this.props.navigation;

        this.checkpono = this.checkpono.bind(this);
    }

    checkpono(val) {
        this.setState({ pono: val });
    }

    //提交扫描结果
    async submitForm() {

        let { status, user, token } = this.props;

        let data = {
            code: user.code,
            psdh: this.state.pono
        }

        if (this.state.pono == '') {
            Alert.alert('错误！', '请扫描配送单条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
            return;
        }
        //this.setState({ submitLoading: true });

        HTTPPOST('/sm/execPSDSM', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    this.refs.toast.show('配送单【' + this.state.pono + '】接收成功！');
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('错误', '配送单[' + this.state.pono + ']，' + res.msg);
                }
                this.refs.textInput1.focus();
                //this.setState({ submitLoading: false });

            }).catch((error) => {
                Alert.alert('错误', error);
                //this.setState({ submitLoading: false });

            });
        //
    }

    showCamera() {
        const { navigate } = this.props.navigation;
        navigate('ScannerCode',
            {
                callback: (backData) => {
                    this.setState({
                        pono: backData
                    });
                }
            })
    }


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

    render() {
        return (
            <ScrollView >
                <WingBlank>
                    <WhiteSpace />
                    <View style={styles.textIconInput}>
                        <Input ref="textInput1"
                            label="配送单："
                            type="text" value={this.state.pono}
                            onChangeText={this.checkpono}
                            onSubmitEditing={this.submitForm.bind(this)}
                            autoFocus={this.state.pono_focused}
                            style={styles.inputS}
                            width={SCREEN_WIDTH - 70}
                            keyboardType="email-address"
                            errorMessage={this.state.pono_emessage}
                            selectTextOnFocus={true}
                        />

                    </View>
                    <WhiteSpace /><WhiteSpace />

                    <View>
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='确认并签收' />
                    </View>

                    <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />
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
)(ScanMaterialDistribution)


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