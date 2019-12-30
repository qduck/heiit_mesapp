import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, KeyboardAvoidingView, Keyboard, YellowBox, TouchableHighlight, TextInput } from 'react-native';
import { Input, FormValidationMessage, Button, Header, CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { WhiteSpace, WingBlank, Flex, List, Switch, Modal, Provider, InputItem, Picker, Checkbox } from '@ant-design/react-native';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';
import ImagePicker from 'react-native-image-picker';

import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
import StringUtil from '../../api/StringUtil'
import { LogError } from '../../api/Logger';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CheckboxItem = Checkbox.CheckboxItem;

const photoOptions = {
    title: '请选择',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: '拍照',
    chooseFromLibraryButtonTitle: '选择相册',
    quality: 0.5,
    maxWidth: 1920,
    maxHeight: 1080,
    allowsEditing: false,
    noData: true,
    storageOptions: {
        skipBackup: true,
        path: 'iqc/' + StringUtil.getNowDate(),
        cameraRoll: false,
        waitUntilSaved: true,
    },
};

class IQCUnqualified extends React.Component {
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

            QCDialogVisible: false,
            QCIndex: null,
            QCNumber: null, //不合格登记
            QCRemark: "",
            QChandle: [],    //不合格处理方式
            QCHthes: [],
            QCPhotoCount: 0, //照片数量
            QCPhotoes: [],   //照片


            QJList: [], //缺件行记录信息
            HthDialogVisible: false,
            qchandlemethodes: [
                { value: '退货', label: '退货' },
                { value: '现场返工', label: '现场返工' },
                { value: '让步接收', label: '让步接收' },
                { value: '全检拣用', label: '全检拣用' },
                { value: '其他处理', label: '其他处理' }
            ],
            partHthes: [], //行的部件合同清单
            partHthList: [], //行的部件合同清单格式化
            SearchPart: "",
            qcphotoloading: false
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
            po_no: this.state.pono,
            list: []
        }

        let submitData = [];
        this.state.QJList.forEach(element => {
            let qjnum = element.qcnumber;
            for (var qindex = element.linenos.length - 1; qindex >= 0; qindex--) {
                let lineno = element.linenos[qindex];
                let linebjnum = element.linenumber[qindex];
                let linehth = element.linehthes[qindex]; //行的排产编号
                if (element.qchthes && element.qchthes.length >= 1) {
                    //判断缺件合同号是否是当前行的合同号，如果是，则记录该行不合格，否则，跳过该行
                    if (element.qchthes.indexOf(linehth) < 0) {
                        //不存在
                        continue;
                    }
                }

                let lineqjnum = 0; //当前行的缺件数量
                linebjnum = parseFloat(linebjnum);
                qjnum = parseFloat(qjnum);
                if (!StringUtil.isRealNum(linebjnum)) {
                    Alert.alert('订单行数据错误', '部件数量为非数字！部件数量：' + linebjnum + '行号：' + lineno);
                    LogError('订单行数据错误', '部件数量为非数字！部件数量：' + linebjnum + '行号：' + lineno);
                    submitData = [];
                    break;
                }

                if (linebjnum < qjnum) {
                    lineqjnum = linebjnum;
                    qjnum = qjnum - linebjnum;
                    submitData.push({
                        po_lineno: lineno,
                        part_uqnum: lineqjnum,
                        part_uq_remark: element.qcremark,
                        photoids: element.qcphoto.join(','),
                        processing_mode: element.qchandle.join(','),
                        zzcontractno: linehth
                    });
                } else {
                    lineqjnum = qjnum;
                    qjnum = 0;
                    submitData.push({
                        po_lineno: lineno,
                        part_uqnum: lineqjnum,
                        part_uq_remark: element.qcremark,
                        photoids: element.qcphoto.join(','),
                        processing_mode: element.qchandle.join(','),
                        zzcontractno: linehth
                    });
                    break;
                }
            }

        });
        data.list = submitData;

        HTTPPOST('/qc/addUnqualified', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    this.refs.toast.show('订单【' + this.state.pono + '】入库成功！');

                    this.setState({ poList: [] });
                    this.setState({ QJList: [] });
                    this.setState({ quejianCount: 0 });
                    this.setState({ pono: "" });
                    this.setState({ SearchPart: "" });
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

    //不合格开关
    onSwitchChange(index, obj, event) {

        //初始化部件合同清单
        let oldobj = this.state.poList[index];
        this.setState({ partHthes: oldobj.hthstr });

        //显示对话框
        this.setState({ QCDialogVisible: true });
        this.setState({ QCIndex: index });

        if (oldobj.isquejian && oldobj.isquejian == 1) {
            //已设置缺件，显示设置值
            this.setState({ QCNumber: oldobj.qcnumber });
            this.setState({ QCRemark: oldobj.qcremark });
            this.setState({ QChandle: oldobj.qchandle });
            this.setState({ QCHthes: oldobj.qchthes });
            this.setState({ QCPhotoes: oldobj.qcphoto });
            this.setState({ QCPhotoCount: oldobj.qcphoto.length });
        } else {
            //未设置过，显示空表单
            this.setState({ QCNumber: "" });
            this.setState({ QCRemark: "" });
            this.setState({ QChandle: "" });
            this.setState({ QCHthes: [] });
            this.setState({ QCPhotoes: [] });
            this.setState({ QCPhotoCount: 0 });
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

    //不合格信息确认
    QJCommit() {
        let obj1 = JSON.parse(JSON.stringify(this.state.poList));
        if (this.state.QCIndex >= 0) {
            let newobj = obj1[this.state.QCIndex];

            if (!StringUtil.isRealNum(this.state.QCNumber)) {
                Alert.alert('不合格数量请输入数字！', '不合格数量信息不能包含字符串，谢谢！');
                return;
            }
            if (this.state.QCRemark == '') {
                Alert.alert('请输入不合格描述！', '不合格描述不能为空字符串，谢谢！');
                return;
            }
            if (this.state.QChandle.length == 0) {
                Alert.alert('请填下处置方式！', '请填写处置方式，谢谢！');
                return;
            }

            if (this.state.QCNumber > 0) {
                if (newobj.qjnum < this.state.QCNumber) {
                    Alert.alert('缺件数量大于物料数！', '缺件的部件数量不能大于订单行物料数量，谢谢！');
                    return;
                }
                newobj.isquejian = 1;
                newobj.qcnumber = this.state.QCNumber;
                newobj.qcremark = this.state.QCRemark;
                newobj.qchandle = this.state.QChandle;
                newobj.qchthes = this.state.QCHthes;
                newobj.qcphoto = JSON.parse(JSON.stringify(this.state.QCPhotoes));

                let QJObj = this.state.QJList.filter(item => item.index == this.state.QCIndex);
                if (QJObj.length > 0) {
                    QJObj[0].qcnumber = this.state.QCNumber;
                    QJObj[0].qcremark = this.state.QCRemark;
                    QJObj[0].qchandle = this.state.QChandle;
                    QJObj[0].qchthes = this.state.QCHthes;
                    QJObj[0].qcphoto = JSON.parse(JSON.stringify(this.state.QCPhotoes));
                } else {
                    this.state.QJList.push({
                        index: this.state.QCIndex,
                        linenos: newobj.ebelpstr,
                        linenumber: newobj.qjnumstr,
                        linehthes: newobj.hthstr,
                        qcnumber: this.state.QCNumber,
                        qcremark: this.state.QCRemark,
                        qchandle: this.state.QChandle,
                        qchthes: this.state.QCHthes,
                        qcphoto: JSON.parse(JSON.stringify(this.state.QCPhotoes))
                    });
                }
                this.setState({ quejianCount: this.state.QJList.length });

            } else {
                let NewQJList = this.state.QJList.filter(item => item.index != this.state.QCIndex);
                this.setState({ QJList: NewQJList });
                this.setState({ quejianCount: this.state.QJList.length });
                newobj.isquejian = 0;
                newobj.qcnumber = 0;
                newobj.qcremark = "";
                newobj.qchandle = "";
                newobj.qchthes = [];
                newobj.qcphoto = [];
            }
            obj1.splice(this.state.QCIndex, 1, newobj);
            this.setState({ poList: obj1 });
            this.setState({ QCDialogVisible: false });
        } else {
            Alert.alert('没有显示缺件的行记录！', '行号[' + this.state.QCIndex + ']，请确认！');
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
        this.setState({ QCHthes: [] });
        let qjhthes = [];
        this.state.partHthList.forEach((item) => {
            if (item.ischecked) {
                qjhthes.push(item.hth);
            }
        })
        this.setState({ QCHthes: qjhthes });
        this.setState({ HthDialogVisible: false });
    }
    onChangeQChandle(value) {
        this.setState({ QChandle: value });
    }
    //获取不合格照片
    takeQJPhoto() {
        this.setState({ qcphotoloading: true });
        ImagePicker.launchCamera(photoOptions, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                this.setState({ qcphotoloading: false });
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                this.setState({ qcphotoloading: false });
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                this.setState({ qcphotoloading: false });
            }
            else {
                console.log('照片文件路径' + response.uri);



                this.uploadphoto(response.uri);

                //this.refs.toast.show('获取照片【' + image.path + '】成功！');
            }

        });
    }

    uploadphoto(imgpath) {
        let { status, user, token } = this.props;

        let formdata = new FormData();

        formdata.append('filetype', 'IQC');
        let photofile = { uri: imgpath, type: 'application/octet-stream', name: 'cameraphoto.jpg' };
        formdata.append('file', photofile);

        //开始上传
        HTTPPOST_Multipart('/qc/uploadPhotoParam', formdata, token)
            .then((res) => {
                if (res.code > 0) {
                    //文件ID
                    let qcphotoes = JSON.parse(JSON.stringify(this.state.QCPhotoes));
                    qcphotoes.push(res.data);
                    this.setState({ QCPhotoCount: qcphotoes.length });
                    this.setState({ QCPhotoes: qcphotoes });

                    this.refs.toast.show('上传照片成功，请继续！');
                } else {
                    LogError('上传不合格照片错误', '上传照片【' + imgpath + '】失败！' + res.code + ':' + res.msg);
                    Alert.alert('上传不合格照片错误', '上传照片【' + imgpath + '】失败！' + res.code + ':' + res.msg);
                }
                this.setState({ qcphotoloading: false });
            }).catch((err) => {
                Alert.alert('上传不合格照片异常', '上传照片【' + imgpath + '】异常！' + err);
                //console.log(err);
                this.setState({ qcphotoloading: false });
            })
    }

    render() {
        YellowBox.ignoreWarnings(['Switch:']);
        const footerButtons = [
            { text: '取消', onPress: () => this.setState({ QCDialogVisible: false }) },
            { text: '确认', onPress: () => this.QJCommit() },
        ];
        return (
            <Provider>
                <ScrollView>
                    <Header
                        placement="left"
                        leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                        centerComponent={{ text: '进货质检', style: { color: '#fff', fontWeight: 'bold' } }}
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
                                不合格登记</Text>
                        </Flex>
                        <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>
                            <List>
                                {
                                    this.state.poList.map((l, index) => (
                                        <List.Item key={l.bjh + index} wrap style={(l.bjh.indexOf(this.state.SearchPart) >= 0 || l.maktx.indexOf(this.state.SearchPart) >= 0) ? {} : { display: 'none', }}
                                            extra={
                                                <Text>
                                                    {'数量:' + l.qjnum + (l.isquejian && l.isquejian == 1 ? ' 不合格:' + l.qcnumber : '')}
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
                                title={'提交(不合格行数:' + this.state.quejianCount + ')'} />
                        </Flex>

                    </WingBlank>
                    <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />
                    <Modal
                        title="不合格登记"
                        transparent
                        onClose={this.onClose}
                        maskClosable
                        visible={this.state.QCDialogVisible}
                        closable
                        footer={footerButtons}
                    >
                        <View style={{ paddingVertical: 10 }}>

                            <InputItem
                                type="number"
                                value={this.state.QCNumber}
                                clear
                                placeholder="不合格数量输入"
                                labelNumber={5}
                                onChange={(value) => this.setState({ QCNumber: value })}
                                style={{ padding: 0, margin: 0, }}
                            >
                                <Text style={styles.dialogLabel}>不合格数:</Text>
                            </InputItem>
                            <InputItem
                                value={this.state.QCRemark}
                                clear
                                placeholder="请输入不合格描述"
                                labelNumber={5}
                                onChangeText={(text) => this.setState({ QCRemark: text })}
                                style={{ padding: 0, margin: 0, }}
                            >
                                <Text style={styles.dialogLabel}>问题描述:</Text>
                            </InputItem>
                            <Picker
                                data={this.state.qchandlemethodes}
                                cols={1}
                                value={this.state.QChandle}
                                onChange={this.onChangeQChandle.bind(this)}

                            >
                                <List.Item arrow="horizontal" style={{ padding: 0, margin: 0, textAlign: "left" }}>
                                    <Text style={styles.dialogLabel}>处置方式:</Text>
                                </List.Item>
                            </Picker>
                            <WhiteSpace /><WhiteSpace />
                            <Text>下面是可选项</Text>
                            <List style={{ marginTop: 12 }}>
                                <List.Item style={{ padding: 0, margin: 0 }}>
                                    <TouchableHighlight onPress={(ref) => this.showSelectHthDialog(ref)}>
                                        <InputItem
                                            value={this.state.QCHthes.join(';')}
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
                                <List.Item style={{ padding: 0, margin: 0 }}>
                                    <Button backgroundColor='#CCC' activeOpacity={1}
                                        type="clear"
                                        containerStyle={{ width: 155, padding: 0, margin: 0, }}
                                        onPress={this.takeQJPhoto.bind(this)}
                                        loading={this.state.qcphotoloading}
                                        title={'不合格拍照（' + this.state.QCPhotoCount + '）'} />
                                </List.Item>
                            </List>
                        </View>
                    </Modal>
                    <Modal
                        transparent={false}
                        visible={this.state.HthDialogVisible}
                        animationType="slide-up"
                        onClose={this.onHthChecked}
                        style={styles.dialogHthModal}
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
            </Provider >
        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token
    })
)(IQCUnqualified)


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
    dialogHthModal: {

    },
    dialogHthCheck: {
        height: SCREEN_HEIGHT - 65,
        padding: 5
    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        paddingRight: 0, marginRight: 0, marginLeft: 20
    },
    dialogLabel: {
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 15,
        padding: 0, margin: 0
    },
    partlistHeader: {

    }
});