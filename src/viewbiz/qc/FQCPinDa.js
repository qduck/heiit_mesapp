import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, TouchableHighlight, NativeModules } from 'react-native';
import { Input, Button, Header, CheckBox } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex, List, Switch, InputItem, Picker, Provider } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';
import ModalDropdown from 'react-native-modal-dropdown';
import StringUtil from '../../api/StringUtil';
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'


// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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
        path: 'oqc/' + StringUtil.getNowDate(),
        cameraRoll: false,
        waitUntilSaved: true,
    },
};

class FQCPinDa extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pono: '',
            pono_valid: true,

            orderno_emessage: '',
            orderno_focused: true,  //默认选中
            orderno: '', //检验合同号

            fqcboxes: [], //检验箱子数据
            otherboxes: [], //不需要检验的箱子数据

            boxselected: null,  //被选中要新增的检验箱子

            addboxLoading: false,
            submitLoading: false,
            searchloading: false,

            photoloading: false,

            checked: false,
            photouploaded: 0,
            QCRemark: "",
            qchandlemethodes: [
                { value: '', label: '' },
                { value: '退货', label: '退货' },
                { value: '现场返工', label: '现场返工' },
                { value: '让步接收', label: '让步接收' },
                { value: '全检拣用', label: '全检拣用' },
                { value: '其他处理', label: '其他处理' }
            ],
            QChandle: ""
        };
        //const navigate = this.props.navigation;

        this.checkorderno = this.checkorderno.bind(this);

    }

    onSwitchChange(index, obj, event) {
        let obj1 = JSON.parse(JSON.stringify(this.state.fqcboxes));
        let newobj = obj1[index];
        if (newobj.ispdhg == '不合格' || newobj.ispdhg == '待检验') {
            newobj.ispdhg = '合格';
        } else {
            newobj.ispdhg = '不合格';
        }
        obj1.splice(index, 1, newobj);
        this.setState({ fqcboxes: obj1 });
    }


    checkorderno(val) {
        this.setState({ orderno: val });
    }

    //提交扫描结果
    async submitForm() {

        let { status, user, token } = this.props;

        if (this.state.fqcboxes.length <= 0) {
            Alert.alert('错误', '没有可提交的检验结果信息，请确认！');
            return;
        }

        this.state.fqcboxes.forEach(item => {
            if (item.ispdhg != '不合格') {
                item.ispdhg = '合格'
            }
        });

        let data = {
            smList: this.state.fqcboxes,
            smtype: 0,
            userCode: user.code,
            userName: user.loginName,
        }

        HTTPPOST('/sm/updateBoxHG', data, token)
            .then((res) => {
                if (res.code >= 1) {

                    this.refs.toast.show('提交拼搭检验结果成功！');

                    this.setState({ orderno: '' });
                    this.setState({ fqcboxes: [] });
                    this.setState({ otherboxes: [] });
                    this.refs.selectaddbox.select(-1);
                    this.refs.textInput1.focus();
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('提交拼搭检验结果失败', res.msg);
                }
                //this.setState({ submitLoading: false });
                this.refs.textInput1.focus();
            }).catch((error) => {
                Alert.alert('提交拼搭检验结果异常', error.message);
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
        this.refs.selectaddbox.hide();
    }

    //从服务端获取需要做成品检验的箱子信息
    getboxes() {
        let { status, user, token } = this.props;
        let theorderno = this.state.orderno;
        if (theorderno.indexOf('  ') >= 0) {
            //扫描的信息为唛头条码
            theorderno = theorderno.substring(0, theorderno.indexOf('  '));
        } else if (theorderno.indexOf(' ') >= 0) {
            theorderno = theorderno.substring(0, theorderno.indexOf(' '));
        }

        if (theorderno == "") {
            Alert.alert('错误', '请扫描合同号信息！');
            return;
        } else {
            this.refs.toast.show('查询【' + theorderno + '】待检验箱子...', DURATION.LENGTH_LONG);
        }

        let datareq = {
            hth: theorderno,
            smtype: '0',   //0表示拼搭，1表示联动
            //hgtype: '',  //为空，查询待检验箱子
        }
        this.setState({ fqcboxes: [] });
        this.setState({ otherboxes: [] });
        this.setState({ searchloading: true });
        HTTPPOST('/sm/getHTHBoxInfoAndPhoto', datareq, token)
            .then((res) => {
                if (res.code >= 1) {
                    if (res.list && res.list.length >= 1) {

                        let qcboxlist = [];
                        let otherboxlist = [];
                        res.list.forEach(qcitem => {
                            if (qcitem.ispdhg && qcitem.ispdhg != '免检') {
                                qcboxlist.push(qcitem);
                            } else {
                                otherboxlist.push(qcitem);
                            }
                        });
                        this.setState({ fqcboxes: qcboxlist });  //待检验箱子数据
                        this.setState({ otherboxes: otherboxlist });

                        this.refs.toast.show('合同【' + theorderno + '】待检验箱子，接收成功！', DURATION.LENGTH_LONG);
                        this.setState({ searchloading: false });
                    } else {
                        this.setState({ fqcboxes: [] });
                        this.setState({ otherboxes: [] });
                        this.refs.toast.show('合同【' + theorderno + '】无待检验箱，请知悉！', DURATION.LENGTH_LONG);
                        this.setState({ searchloading: false });
                    }


                    if (res.photoNum) {
                        this.setState({ photouploaded: res.photoNum });
                    }
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('错误', '合同[' + theorderno + ']，' + res.code + ':' + res.msg, [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
                    this.setState({ searchloading: false });
                }
                //
            }).catch((error) => {
                Alert.alert('异常', error);
                this.setState({ searchloading: false });
            });
    }

    //添加箱子到待检验清单中
    addboxClick() {
        if (this.state.boxselected) {
            let obj1 = JSON.parse(JSON.stringify(this.state.boxselected));
            this.state.fqcboxes.push(obj1);

            let newother = this.state.otherboxes.filter(item => item.pkid != obj1.pkid);
            this.setState({ otherboxes: newother });

            this.refs.selectaddbox.select(-1);
            this.setState({ boxselected: null });
            this.refs.toast.show('箱子【' + obj1.boxName + '】添加检验任务成功！');
        } else {
            Alert.alert('错误', '请选择要手工添加的检验的箱子！');
        }
    }

    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }

    selectaddbox_renderButtonText(rowData) {
        const { boxName, mt, } = rowData;
        return `${boxName} - ${mt}`;
    }

    selectaddbox_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={styles.selectrow}>
                    <Text>
                        {`${rowData.boxName} (${rowData.mt})`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    selectaddbox_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //Alert.alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);

        // if (value) {
        //     this.state.fqcboxes.push(value);
        //     this.state.otherboxes.filter(item => item.pkid!=value.pkid)
        // }
        if (value) {
            this.setState({ boxselected: value });  //箱子选中后
        } else {
            this.setState({ boxselected: null });  //箱子选中后
        }

    }

    //获取照片
    async getphoto(cropping, mediaType = 'photo') {
        let theorderno = this.state.orderno;
        if (theorderno.indexOf('  ') >= 0) {
            //扫描的信息为唛头条码
            theorderno = theorderno.substring(0, theorderno.indexOf('  '));
        } else if (theorderno.indexOf(' ') >= 0) {
            theorderno = theorderno.substring(0, theorderno.indexOf(' '));
        }

        if (theorderno == "") {
            Alert.alert('错误', '无合同号信息！');
            return;
        }

        this.setState({ photoloading: true });
        await ImagePicker.launchCamera(photoOptions, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                this.setState({ photoloading: false });
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                this.setState({ photoloading: false });
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                this.setState({ photoloading: false });
            }
            else {
                this.uploadphoto(theorderno, response.uri);
                //this.refs.toast.show('获取照片【' + image.path + '】成功！');
            }

        });
    }

    async uploadphoto(orderno, imgpath) {
        let { status, user, token } = this.props;

        let formdata = new FormData();
        formdata.append('usercode', user.code);

        formdata.append('HTH', orderno);
        let photofile = { uri: imgpath, type: 'application/octet-stream', name: 'cameraphoto.jpg' };
        formdata.append('file', photofile);

        //开始上传
        await HTTPPOST_Multipart('/sm/uploadPDSMPhotoParam', formdata, token)
            .then((res) => {
                if (res.code > 0) {
                    this.setState({ photouploaded: res.data });
                    this.refs.toast.show('上传照片【' + imgpath + '】成功！');
                } else {
                    Alert.alert('错误', '上传照片【' + imgpath + '】失败！' + res.code + ':' + res.msg);
                }
                this.setState({ photoloading: false });
            }).catch((err) => {
                Alert.alert('异常', '上传照片【' + imgpath + '】异常！' + err);
                //console.log(err);
                this.setState({ photoloading: false });
            })
    }
    onChangeQChandle(value) {
        this.setState({ QChandle: value });
    }
    render() {
        return (
            <Provider>
                <ScrollView >
                    <Header
                        placement="left"
                        leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                        centerComponent={{ text: '成品拼搭检验', style: { color: '#fff', fontWeight: 'bold' } }}
                        containerStyle={styles.headercontainer}
                    />
                    <WingBlank size="sm">
                        <WhiteSpace size="sm" />
                        <View style={styles.textIconInput}>
                            <Input ref="textInput1"
                                label="检验合同号(扫描唛头获得)："
                                type="text" value={this.state.orderno}
                                onChangeText={this.checkorderno}
                                onSubmitEditing={this.getboxes.bind(this)}
                                autoFocus={this.state.orderno_focused}
                                style={styles.inputS}
                                keyboardType="email-address"
                                errorMessage={this.state.orderno_emessage}
                                selectTextOnFocus={true}
                            />

                        </View>
                        <WhiteSpace size="sm" />
                        <Flex style={{ padding: 10 }} justify="between">
                            <Text style={{ fontWeight: 'bold' }}>待检验箱：</Text>
                            <Text style={{ fontWeight: 'bold' }}>检验结果</Text>
                        </Flex>
                        <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>
                            <List>
                                {
                                    this.state.fqcboxes.map((l, index) => (
                                        <List.Item key={l.pkid}
                                            extra={
                                                <Text>
                                                    {l.ispdhg == '不合格' || l.ispdhg == '待检验' ? ' [不合格]' : ' [合格]'}
                                                    <Switch
                                                        color="red"

                                                        checked={l.ispdhg == '不合格' || l.ispdhg == '待检验' ? true : false}
                                                        onChange={this.onSwitchChange.bind(this, index, l)}
                                                    /></Text>
                                            }
                                        >
                                            {l.boxName}
                                            {<Text style={{ fontSize: 10 }}>
                                                {l.mt + '  ' + l.pdremark}</Text>
                                            }
                                        </List.Item>
                                    ))
                                }
                            </List>
                        </ScrollView>

                        <Flex style={{ padding: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>新增检验箱：</Text>

                        </Flex>
                        <Flex style={{ paddingLeft: 10 }} justify="between">

                            <ModalDropdown
                                options={this.state.otherboxes.length >= 1 ? this.state.otherboxes : null}
                                style={styles.Selecter}
                                textStyle={styles.SelecterText}
                                dropdownStyle={styles.SelecterDropDown}
                                ref="selectaddbox"
                                renderButtonText={(rowData) => this.selectaddbox_renderButtonText(rowData)}
                                renderRow={this.selectaddbox_renderRow.bind(this)}
                                onSelect={(idx, value) => this.selectaddbox_onSelect(idx, value)}
                            />


                            <Button buttonStyle={styles.addboxbtn}
                                backgroundColor='#AAA' activeOpacity={1}
                                onPress={this.addboxClick.bind(this)}
                                title='添加'
                                loading={this.state.addboxLoading}
                            />

                        </Flex>
                        <List>
                            <InputItem
                                value={this.state.QCRemark}
                                clear
                                placeholder="请输入不合格描述"
                                labelNumber={5}
                                onChangeText={(text) => this.setState({ QCRemark: text })}
                                style={{ padding: 0, margin: 0, backgroundColor: "#FFF" }}
                            >
                                <Text style={styles.dialogLabel}>问题描述:</Text>
                            </InputItem>
                        </List>
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
                        <WhiteSpace size="sm" />

                        <Flex justify="between">
                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={this.getboxes.bind(this)}
                                loading={this.state.searchloading}
                                title='查询项' />

                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={() => this.getphoto(false)}
                                loading={this.state.photoloading}
                                title={'拍照(' + this.state.photouploaded + ')'} />

                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={this.submitForm.bind(this)}
                                loading={this.state.submitLoading}
                                title='提交结果' />
                        </Flex>

                        <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />
                    </WingBlank>
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
)(FQCPinDa)


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
        paddingRight: 0, marginRight: 0,
    },
    Selecter: {
        height: 30,
        width: (SCREEN_WIDTH - 40) / 2,
        backgroundColor: '#FFF',
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
        width: SCREEN_WIDTH - 40,
        height: 200,
    },
    selectrow: {
        padding: 5,
    },
    addboxbtn: {
        height: 25,
        width: 60,
    },
    partlistclass: {
        padding: 5,
        height: SCREEN_HEIGHT - 415,
    },
    checkboxarea: {
        alignItems: 'flex-end',
        width: 100,
        paddingLeft: 100,
        marginLeft: 100,
        alignSelf: 'flex-end',
    },
    checkbox: {
        padding: 3,
        paddingLeft: 5,
        margin: 2,
        marginRight: 0,
        width: 80,
    },
    dialogLabel: {
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 15,
        padding: 0, margin: 0
    },
});