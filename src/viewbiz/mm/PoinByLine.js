import React from 'react';
import { TextInput, Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, KeyboardAvoidingView, Keyboard, TouchableHighlight } from 'react-native';
import { Input, FormValidationMessage, Button, Header, CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { WhiteSpace, WingBlank, Flex, List, Switch, Modal, Provider, InputItem, Checkbox } from '@ant-design/react-native';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';

import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
import StringUtil from '../../api/StringUtil'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CheckboxItem = Checkbox.CheckboxItem;

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
            QJHthes: [],

            QJList: [], //缺件行记录信息
            LoadByPoLine: false,
            SearchPart: "",
            partHthList: [],   //部件对应的合同号清单
            partHthes: [],
            HthDialogVisible: false,
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
                let linehth = element.linehthes[qindex]; //行的排产编号
                if (element.qjhthes && element.qjhthes.length >= 1) {
                    //判断缺件合同号是否是当前行的合同号，如果是，则记录该行不合格，否则，跳过该行
                    if (element.qjhthes.indexOf(linehth) < 0) {
                        //不存在
                        continue;
                    }
                }


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
        this.setState = (state, callback) => {
            return
        }
    }

    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }

    //缺件开关
    onSwitchChange(index, obj, event) {
        let oldobj = this.state.poList[index];
        this.setState({ partHthes: oldobj.hthstr });

        this.setState({ QJDialogVisible: true });
        this.setState({ QJIndex: index });

        if (oldobj.isquejian && oldobj.isquejian == 1) {
            this.setState({ QJNumber: oldobj.quejiannum });
            this.setState({ QJRemark: oldobj.qjremark });
            this.setState({ QJHthes: oldobj.qjhthes });
        } else {
            this.setState({ QJNumber: "" });
            this.setState({ QJRemark: "" });
            this.setState({ QJHthes: [] });
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
                    Alert.alert('获取未入库物料错误', '订单[' + data.packBarCode + ']' + res.code + ' ,' + res.message);
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

            if (this.state.QJNumber > 0) {
                if (newobj.qjnum < this.state.QJNumber) {
                    Alert.alert('缺件数量大于物料数！', '缺件的部件数量不能大于订单行物料数量，谢谢！');
                    return;
                }
                newobj.isquejian = 1;
                newobj.quejiannum = this.state.QJNumber;
                newobj.qjremark = this.state.QJRemark;
                newobj.qjhthes = this.state.QJHthes;

                let QJObj = this.state.QJList.filter(item => item.index == this.state.QJIndex);
                if (QJObj.length > 0) {
                    QJObj[0].qjnum = this.state.QJNumber;
                    QJObj[0].qjremark = this.state.QJRemark;
                    QJObj[0].qjhthes = this.state.QJHthes;
                } else {
                    this.state.QJList.push({
                        index: this.state.QJIndex,
                        linenos: newobj.ebelpstr,
                        linenumber: newobj.qjnumstr,
                        linehthes: newobj.hthstr,
                        qjnum: this.state.QJNumber,
                        qjremark: this.state.QJRemark,
                        qjhthes: this.state.QJHthes,
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
                newobj.qjhthes = [];
            }
            obj1.splice(this.state.QJIndex, 1, newobj);
            this.setState({ poList: obj1 });
            this.setState({ QJDialogVisible: false });
        } else {
            Alert.alert('没有显示缺件的行记录！', '行号[' + this.state.QJIndex + ']，请确认！');
        }
    }

    //显示选择合同号清单的列表
    showSelectHthDialog() {
        this.setState({ partHthList: [] });
        let hthlist = [];
        this.state.partHthes.forEach((item) => {
            hthlist.push({ hth: item, ischecked: false });
        });
        this.setState({ partHthList: hthlist });
        this.setState({ HthDialogVisible: true });
    }
    //选择不合格的合同号清单
    onHthChecked() {
        this.setState({ QJHthes: [] });
        let qjhthes = [];
        this.state.partHthList.forEach((item) => {
            if (item.ischecked) {
                qjhthes.push(item.hth);
            }
        })
        this.setState({ QJHthes: qjhthes });
        this.setState({ HthDialogVisible: false });
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
                        <Flex style={{ padding: 0, margin: 0, paddingBottom: 5, paddingTop: 5 }} justify="between" >
                            <View style={{
                                width: 200,
                                paddingLeft: 2,
                            }} >
                                <Flex style={{ padding: 0, margin: 0 }} justify="start" >
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, width: 65, padding: 0, margin: 0 }}>订单行：</Text>
                                    <TextInput type="text"
                                        style={{ fontSize: 14, width: 100, backgroundColor: '#FFF', padding: 0 }}
                                        ref="SearchPart"
                                        placeholder="关键字过滤"
                                        onChangeText={(text) => this.setState({ SearchPart: text })}
                                        value={this.state.SearchPart}
                                    />
                                </Flex>
                            </View>

                            <Text style={{ fontWeight: 'bold', width: 150, textAlign: 'right', paddingRight: 2 }}>
                                缺件登记</Text>
                        </Flex>
                        <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>
                            <List>
                                {
                                    this.state.poList.map((l, index) => (
                                        <List.Item
                                            key={l.bjh + index} wrap
                                            style={(l.bjh.indexOf(this.state.SearchPart) >= 0 || l.maktx.indexOf(this.state.SearchPart) >= 0) ? {} : { display: 'none', }}
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
                            <WhiteSpace /><WhiteSpace />
                            <Text>下面是可选项</Text>
                            <List style={{ marginTop: 12 }}>
                                <List.Item style={{ padding: 0, margin: 0 }}>
                                    <TouchableHighlight onPress={(ref) => this.showSelectHthDialog(ref)}>
                                        <InputItem
                                            value={this.state.QJHthes.join(';')}
                                            clear
                                            placeholder="指定合同号"
                                            labelNumber={5}
                                            style={{ padding: 0, margin: 0, }}
                                            clear
                                            editable={false}
                                        >
                                        </InputItem>
                                    </TouchableHighlight>
                                </List.Item>
                            </List>
                        </View>
                    </Modal>
                    <Modal
                        transparent={false}
                        visible={this.state.HthDialogVisible}
                        animationType="slide-up"
                        onClose={this.onHthChecked}

                    >
                        <ScrollView style={styles.dialogHthCheck}>

                            <List style={{ marginTop: 12 }}>
                                <Text style={{ marginTop: 12 }}>请勾择不合格的合同号</Text>
                                {
                                    this.state.partHthList.map((l) => (
                                        <CheckboxItem onChange={event => {
                                            event.target.checked ? l.ischecked = true : l.ischecked = false;
                                        }}>{l.hth}</CheckboxItem>
                                    ))
                                }
                            </List>
                        </ScrollView>
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.onHthChecked.bind(this)}
                            ref="hthcheckbtn"
                            title={'确认'} />
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
    dialogHthCheck: {
        height: SCREEN_HEIGHT - 65,
        padding: 5
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