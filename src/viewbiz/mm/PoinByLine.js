import React from 'react';
import { TextInput, Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Input, FormValidationMessage, Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { WhiteSpace, WingBlank, Flex, List, Switch, Modal, Provider } from '@ant-design/react-native';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';

import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
import StringUtil from '../../api/StringUtil'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


class PoinByLine extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pono: '',
            pono_emessage: '',
            pono_focused: true,
            submitLoading: false,
            quejianCount: 0,//缺件记录数
            poList: [],
            posearching: false,
            QJDialogVisible: false,
            QJIndex: null,
            QJNumber: null,
            QJRemark: "",
            QJList: [] //缺件行记录信息
        };

    }
    _keyboardWillShow() {

    }

    checkpono(val) {
        this.setState({ pono: val });
    }

    //提交扫描结果
    submitForm() {
        this.setState({ submitLoading: true });
        let { status, user, token } = this.props;

        let data = {
            usercode: user.code,
            ebeln: this.state.pono,
            data: []
        }

        let submitData = [];
        this.state.QJList.forEach(element => {
            let qjnum = element.qjnum;
            for (var qindex = element.linenos.length - 1; qindex >= 0; qindex--) {
                let lineno = element.linenos[qindex];
                let linebjnum = element.linenumber[qindex];
                let lineqjnum = 0; //当前行的缺件数量
                linebjnum = parseFloat(linebjnum);
                qjnum = parseFloat(qjnum);
                if (!StringUtil.isRealNum(linebjnum)) {
                    Alert.alert('订单行数据错误', '部件数量为非数字！部件数量：' + linebjnum + '行号：' + lineno);
                    submitData = [];
                    break;
                }

                if (linebjnum < qjnum) {
                    lineqjnum = linebjnum;
                    qjnum = qjnum - linebjnum;
                    submitData.push({
                        ebelp: lineno,
                        qjnum: lineqjnum,
                        qjexplain: element.qjremark
                    });
                } else {
                    lineqjnum = qjnum;
                    qjnum = 0;
                    submitData.push({
                        ebelp: lineno,
                        qjnum: lineqjnum,
                        qjexplain: element.qjremark
                    });
                    break;
                }
            }

        });
        data.data = submitData;

        HTTPPOST('/sm/addOrderLineInfo', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    this.refs.toast.show('订单【' + this.state.pono + '】入库成功！');

                    this.setState({ poList: [] });
                    this.setState({ QJList: [] });
                    this.setState({ quejianCount: 0 });
                    this.setState({ pono: "" });
                    this.setState({ submitLoading: false });

                    this.refs.textInput1.focus();
                } else {
                    Alert.alert('订单入库错误', '订单[' + this.state.pono + ']' + res.code + res.msg);
                    this.setState({ submitLoading: false });
                }
            }).catch((error) => {
                Alert.alert('订单入库异常', error);

                this.setState({ submitLoading: false });

            });
        // /sm/addOrderLineInfo

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

    //缺件开关
    onSwitchChange(index, obj, event) {

        this.setState({ QJDialogVisible: true });
        this.setState({ QJIndex: index });
        let oldobj = this.state.poList[index];
        if (oldobj.isquejian && oldobj.isquejian == 1) {
            this.setState({ QJNumber: oldobj.quejiannum });
            this.setState({ QJRemark: oldobj.qjremark });
        } else {
            this.setState({ QJNumber: "" });
            this.setState({ QJRemark: "" });
        }
    }

    //订单查询
    searchPO() {
        let data = {
            packBarCode: this.state.pono
        };
        let { status, user, token } = this.props;
        this.setState({ posearching: true });

        HTTPPOST('/sm/getORDER_LINE_ERROR', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    this.refs.toast.show('订单【' + data.packBarCode + '】未入库物料获取成功！');

                    this.setState({ poList: res.list });

                    this.setState({ posearching: false });
                } else {
                    Alert.alert('获取未入库物料错误', '订单[' + data.packBarCode + ']' + res.code);
                    this.setState({ posearching: false });
                }
            }).catch((error) => {
                Alert.alert('获取未入库物料异常', error);

                this.setState({ posearching: false });

            });
    }

    //缺件确认
    QJCommit() {
        let obj1 = JSON.parse(JSON.stringify(this.state.poList));
        if (this.state.QJIndex >= 0) {
            let newobj = obj1[this.state.QJIndex];

            if (!StringUtil.isRealNum(this.state.QJNumber)) {
                Alert.alert('缺件数量请输入数字！', '缺件数量信息不能包含字符串，谢谢！');
                return;
            }

            if (this.state.QJNumber >= 1) {
                if (newobj.qjnum < this.state.QJNumber) {
                    Alert.alert('缺件数量大于物料数！', '缺件的部件数量不能大于订单行物料数量，谢谢！');
                    return;
                }
                newobj.isquejian = 1;
                newobj.quejiannum = this.state.QJNumber;
                newobj.qjremark = this.state.QJRemark;
                let QJObj = this.state.QJList.filter(item => item.index == this.state.QJIndex);
                if (QJObj.length > 0) {
                    QJObj[0].qjnum = this.state.QJNumber;
                    QJObj[0].qjremark = this.state.QJRemark;
                } else {
                    this.state.QJList.push({
                        index: this.state.QJIndex,
                        linenos: newobj.ebelpstr,
                        linenumber: newobj.qjnumstr,
                        qjnum: this.state.QJNumber,
                        qjremark: this.state.QJRemark
                    });
                }
                this.setState({ quejianCount: this.state.QJList.length });

            } else {
                let NewQJList = this.state.QJList.filter(item => item.index != this.state.QJIndex);
                this.setState({ QJList: NewQJList });
                this.setState({ quejianCount: this.state.QJList.length });
                newobj.isquejian = 0;
                newobj.quejiannum = 0;
                newobj.qjremark = "";
            }
            obj1.splice(this.state.QJIndex, 1, newobj);
            this.setState({ poList: obj1 });
            this.setState({ QJDialogVisible: false });
        } else {
            Alert.alert('没有显示缺件的行记录！', '行号[' + this.state.QJIndex + ']，请确认！');
        }
    }

    render() {
        const footerButtons = [
            { text: '取消', onPress: () => this.setState({ QJDialogVisible: false }) },
            { text: '确认', onPress: () => this.QJCommit() },
        ];
        return (
            <Provider>
                <ScrollView>
                    <Header
                        placement="left"
                        leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                        centerComponent={{ text: '采购单入库(按订单行)', style: { color: '#fff', fontWeight: 'bold' } }}
                        containerStyle={styles.headercontainer}
                    />
                    <WingBlank size='sm'>
                        <WhiteSpace />
                        <View style={styles.textIconInput}>

                            <Input label="采购订单号：" type="text"
                                selectTextOnFocus={true}
                                ref="textInput1"
                                onSubmitEditing={this.searchPO.bind(this)}
                                onChangeText={(text) => this.setState({ pono: text })}
                                autoFocus={this.state.pono_focused}
                                value={this.state.pono}
                                errorMessage={this.state.pono_emessage}
                            />

                        </View>
                        <WhiteSpace />
                        <Flex style={{ padding: 10 }} justify="between">
                            <Text style={{ fontWeight: 'bold' }}>订单行：</Text>
                            <Text style={{ fontWeight: 'bold' }}>缺件登记</Text>
                        </Flex>
                        <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>
                            <List>
                                {
                                    this.state.poList.map((l, index) => (
                                        <List.Item key={l.bjh + index} wrap
                                            extra={
                                                <Text>
                                                    {'数量:' + l.qjnum + (l.isquejian && l.isquejian == 1 ? ' [缺]' + l.quejiannum : '')}
                                                    <Switch
                                                        color="red"
                                                        checked={l.isquejian && l.isquejian == 1 ? true : false}
                                                        onChange={this.onSwitchChange.bind(this, index, l)}
                                                    /></Text>
                                            }
                                        >
                                            {<Text style={{ fontSize: 15 }}>{l.bjh}</Text>}
                                            {<Text style={{ fontSize: 12 }}>
                                                {l.maktx + '  ' + l.zgg}</Text>
                                            }
                                        </List.Item>
                                    ))
                                }
                            </List>
                        </ScrollView>
                        <WhiteSpace />

                        <Flex justify="between" >
                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={this.searchPO.bind(this)}
                                loading={this.state.posearching}
                                title={'订单查询'} />

                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={this.submitForm.bind(this)}
                                loading={this.state.submitLoading}
                                title={'确认并入库(缺件行数:' + this.state.quejianCount + ')'} />
                        </Flex>

                    </WingBlank>
                    <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />
                    <Modal
                        title="缺件登记"
                        transparent
                        onClose={this.onClose}
                        maskClosable
                        visible={this.state.QJDialogVisible}
                        closable
                        footer={footerButtons}
                    >
                        <View style={{ paddingVertical: 20 }}>
                            <Input
                                label="缺件数量："
                                placeholder='请填写缺少的部件数量'
                                value={this.state.QJNumber}
                                onChangeText={(text) => this.setState({ QJNumber: text })}
                            />
                            <Input
                                label="缺件原因:"
                                placeholder='请输入缺件原因'
                                value={this.state.QJRemark}
                                onChangeText={(text) => this.setState({ QJRemark: text })}
                            />
                        </View>
                    </Modal>
                </ScrollView>
            </Provider>
        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token
    })
)(PoinByLine)


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
    partlistclass: {
        padding: 3,
        height: SCREEN_HEIGHT - 260,
    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        paddingRight: 0, marginRight: 0, marginLeft: 20
    }
});