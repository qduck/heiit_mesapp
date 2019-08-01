import React from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid, TextInput, TouchableHighlight, ScrollView } from 'react-native';
import { Input, Button, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import ModalDropdown from 'react-native-modal-dropdown';
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



class ScanBoxShipping extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            carno: '',
            serialNum: '',

            boxno: '',
            boxno_valid: true,
            boxno_focused: false,
            submitLoading: false,

            carnolinktext: '',
            carnolinktext_focused: true,
            carnolist: [],
        };
        //const navigate = this.props.navigation;

        //this.checkcarno = this.checkcarno.bind(this);
        this.checkboxno = this.checkboxno.bind(this);
        this.checkcarnolinktexts = this.checkcarnolinktexts.bind(this);
    }

    checkboxno(val) {
        this.setState({ boxno: val });
    }

    checkcarnolinktexts(val) {
        this.setState({ carnolinktext: val });
    }

    searchCarNo() {
        let { status, user, token } = this.props;
        let data = {
            packBarCode: this.state.carnolinktext
        }
        if (this.state.carnolinktext == '') {
            Alert.alert('错误！', '请扫描关联条码。');
            return;
        }

        HTTPPOST('/sm/execCarFYSM', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    ToastAndroid.show(
                        '车牌信息获取成功，请选择！',
                        ToastAndroid.LONG
                    );

                    //获取用户数据
                    if (res.list && res.list.length >= 1) {
                        this.setState({ carnolist: res.list });
                        this.refs.select1.select(0);
                        this.setState({ carno: res.list[0].carNo });
                        this.setState({ serialNum: res.list[0].serialnum });
                    }

                    //this.setState({ carnolinktext_focused: false });
                    this.refs.textInput1.focus();
                } else {
                    Alert.alert(res.msg);
                    this.refs.textInput1.focus();
                }
            }).catch((error) => {
                Alert.alert(error);
                this.refs.textInput1.focus();
            });
        this.setState({ carnolinktext: '' });
    }

    //提交扫描结果
    submitForm() {

        let { status, user, token } = this.props;

        let data = {
            code: user.code,
            packCode: this.state.boxno,
            serialNum: this.state.serialNum,
        }
        if (this.state.boxno.trim() == '') {
            Alert.alert('错误！', '请扫描箱子唛头条码。');
            return;
        }
        if (this.state.serialNum.trim() == '') {
            Alert.alert('错误！', '请选择装车车牌号。');
            return;
        }
        //this.setState({ submitLoading: true });
        //Alert.alert(this.state.serialNum);
        HTTPPOST('/sm/execFYGlFYSM', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    ToastAndroid.show(
                        '【' + this.state.boxno + '】发货成功,' + res.msg + '，继续下一个箱子！',
                        ToastAndroid.LONG
                    );
                    //this.setState({ boxno: '' }); ----更新会导致扫描字段显示卡顿
                    this.refs.textInput1.focus();
                } else {
                    Alert.alert('错误！' + res.code, res.msg);
                    this.refs.textInput1.focus();
                }
                //this.setState({ submitLoading: false });
            }).catch((error) => {
                Alert.alert('异常!', error);
                this.refs.textInput1.focus();
                //this.setState({ submitLoading: false });
            });

        this.refs.textInput1.focus();
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

    select1_renderButtonText(rowData) {
        const { carNo, serialnum } = rowData;
        return `${carNo} - ${serialnum}`;
    }

    select1_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={styles.selectrow}>
                    <Text>
                        {`${rowData.carNo} (${rowData.serialnum})`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
    select1_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //Alert.alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);
        this.setState({ carno: value.carNo });
        this.setState({ serialNum: value.serialnum });

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
        this.refs.select1.hide();
    }
    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }
    render() {
        this.props.navigation.navigate('DrawerClose');

        return (
            <ScrollView >
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '成品发货扫描', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>
                    <WhiteSpace />
                    <Text containerStyle={{ alignSelf: 'flex-start' }}>发货车辆：</Text>
                    <View style={styles.CarnoSelecter}>
                        <ModalDropdown options={this.state.carnolist} style={styles.Selecter}
                            textStyle={styles.SelecterText}
                            dropdownStyle={styles.SelecterDropDown}
                            ref="select1"
                            renderButtonText={(rowData) => this.select1_renderButtonText(rowData)}
                            renderRow={this.select1_renderRow.bind(this)}
                            onSelect={(idx, value) => this.select1_onSelect(idx, value)}
                        />
                        <TextInput
                            style={{ height: 30, width: 75, borderColor: 'gray', borderWidth: 1, fontSize: 12, padding: 0, margin: 0 }}
                            onChangeText={this.checkcarnolinktexts}
                            value={this.state.carnolinktexts}
                            selectTextOnFocus={true}
                            placeholder="车牌关联扫描"
                            onSubmitEditing={this.searchCarNo.bind(this)}
                            autoFocus={this.state.carnolinktext_focused}
                        />

                    </View>
                    <WhiteSpace />
                    <Text containerStyle={{ alignSelf: 'flex-start' }}>装箱唛头：</Text>
                    <View style={styles.textIconInput}>
                        <Input ref="textInput1"
                            selectTextOnFocus={true}
                            type="text" value={this.state.boxno}
                            onChangeText={this.checkboxno}
                            onSubmitEditing={this.submitForm.bind(this)}
                            autoFocus={this.state.boxno_focused}
                            style={styles.inputS}
                            selectTextOnFocus={true}
                            keyboardType="email-address"
                        />

                    </View>
                    <WhiteSpace />
                    <WhiteSpace />
                    <View>
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='确认并发货' />

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
        token: state.loginIn.token,
    })
)(ScanBoxShipping)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
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
        paddingRight: 0, marginRight: 0,
    },
    CarnoSelecter: {

        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    Selecter: {
        height: 30,
        width: SCREEN_WIDTH - 110,
        backgroundColor: '#eee',
        borderBottomColor: '#666',
        borderBottomWidth: 1,

    },
    SelecterText: {
        fontSize: 12,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 0,
    },
    SelecterDropDown: {
        width: SCREEN_WIDTH - 110,
        height: 120,
    },
    selectrow: {
        padding: 5,
    }
});