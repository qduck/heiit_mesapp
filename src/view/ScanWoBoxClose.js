import React from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid, FlatList, ScrollView, NativeModules } from 'react-native';
import { Input, Button, ListItem, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../api/HttpRequest';

import { connect } from 'react-redux';
import DeviceStorage from '../api/DeviceStorage';
import StringUtil from '../api/StringUtil';

import TimerScanDataSync from '../viewc/TimerScanDataSync';
import ImagePicker from 'react-native-image-picker';
import { LogInfo, LogException } from '../api/Logger';
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {
//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
import SQLite from '../api/SQLite';
var RNFS = require('react-native-fs');
var sqLite = new SQLite();
var db;

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
        path: 'boxing/' + StringUtil.getNowDate(),
        cameraRoll: false,
        waitUntilSaved: true,
    },
};

class ScanWoBoxClose extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            boxno: '',
            boxno_valid: true,
            boxno_emessage: '',
            boxno_focused: true,

            partno: '',
            partno_valid: true,
            partno_emessage: '',
            partno_focused: false,

            photo: null,
            photoNeedCount: 0,  //需要照片数量
            photoUploadCount: 0, //已上传服务端数量
            photoSyncCount: 0,  //待上传照片数量

            partlist: [
            ],

            scrollMode: 'always',
            submitLoading_PartIn: false,
            submitLoading_BoxClose: false,
            submitLoading_uploadPhoto: false,

            partcheckLoading: false, //刷新按钮的loding状态

            //syncCount: 0, //未同步数量
            theboxScanCount: 0,//当前箱子扫描数量
            avatarSource: null, //

        };
        //const navigate = this.props.navigation;

        this.checkboxno = this.checkboxno.bind(this);
        this.checkpartno = this.checkpartno.bind(this);



    }


    checkboxno(val) {
        this.setState({ boxno: val });
    }

    checkpartno(val) {
        if (val.startsWith('2')) {
            this.setState({ partno: val.split('|')[0] });
        } else {
            this.setState({ partno: val });
        }
    }

    //从部件条码中，获取部件件号。
    getpartnoByPartBarcode() {
        let partbarcode = this.state.partno;
        if (partbarcode == '') {
            return '';
        } else {
            if (partbarcode.startsWith('0')) {
                let seqstr = partbarcode.substring(11, 16);

                if (StringUtil.isRealNum(seqstr)) {
                    //Alert.alert('test！true', seqstr);
                    return partbarcode.substr(16);
                } else {
                    //Alert.alert('test！false', seqstr);
                    return partbarcode.substr(15);
                }
            } else if (partbarcode.startsWith('1')) {
                let gyscode = partbarcode.substring(1, 4);
                if (gyscode == '001') {
                    return partbarcode.substr(13);
                } else {
                    return partbarcode.substr(16);
                }
            } else if (partbarcode.startsWith('2')) {
                let partcode = partbarcode.split('|')[0];
                return partcode.substr(16);
            } else {
                Alert.alert('错误！', '异常条码字符类型！无法识别！');
                return '';
            }
        }
    }

    //判断部件件号是否在待扫描的清单中。
    checkpartnoInList() {
        let plist = this.state.partlist;
        let thepno = this.getpartnoByPartBarcode();

        let pfinded = plist.find(item => {
            return item.partno == thepno;
        });

        if (pfinded != null) {
            //Alert.alert('test！true', JSON.stringify(pfinded));
            return true;
        } else {
            //Alert.alert('test！false', JSON.stringify(pfinded));
            return false;
        }
    }

    //获取部件类型C或C+
    getPartInfoInList() {
        let plist = this.state.partlist;
        let thepno = this.getpartnoByPartBarcode();

        let pfinded = plist.find(item => {
            return item.partno == thepno;
        });

        if (pfinded != null) {
            //Alert.alert('test！true', JSON.stringify(pfinded));
            return pfinded
        } else {
            //Alert.alert('test！false', JSON.stringify(pfinded));
            return null;
        }
    }

    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        let { status } = this.props;
        const { navigate } = this.props.navigation;
        if (status != '1') {
            navigate('Login');
        }
    }

    //在页面组件，控件渲染后触发
    componentDidMount() {

        //开启数据库
        if (!db) {
            db = sqLite.open();
        }
        //建表
        sqLite.createTable_ScanPartInBox();
        //
    }

    //往数据库新增扫描记录
    async scanDataAdd() {
        let { status, user, token } = this.props;
        //=========
        var scanDatas = [];
        let scandata = {};
        scandata.code = user.code;
        scandata.boxno = this.state.boxno;
        scandata.partno = this.state.partno;

        let scanpartinfo = await this.getPartInfoInList();
        scandata.ztype = scanpartinfo.ztype;
        scandata.id = scanpartinfo.id;
        if (scanpartinfo.ztype.trim() == 'C+') {
            scandata.number = 1;
        } else {
            scandata.number = scanpartinfo.number;
        }

        scanDatas.push(scandata)
        //将扫描数据存入数据库
        await sqLite.insertData_ScanPartInBox(scanDatas);

        ToastAndroid.show(
            '关键部件【' + this.state.partno + '】插入成功，请继续！',
            ToastAndroid.LONG
        );

        //重新加载待扫描部件清单
        console.info("扫描关键部件完成，重新加载部件列表！");
        await this.loadPartList(StringUtil.cutStringTail(this.state.boxno, 4));

        this.setState({ partno: '' });
        this.refs.textInput2.focus();
        // this.reflashNuSyncData(); //刷新未同步的扫描数据记录
        this.reflashTheboxScanData();
    }

    //刷新未同步的扫描数据记录


    //刷新未同步的扫描数据记录
    reflashTheboxScanData() {
        //查询
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where boxno='" + this.state.boxno + "'", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let docount = results.rows.item(0).ret;
                    this.setState({ theboxScanCount: docount });
                }
            });
        }, (error) => {
            console.log(error);
        });
    }



    //部件扫描结果
    submitForm_partin() {
        let { status, user, token } = this.props;

        if (this.state.boxno == '') {
            Alert.alert('错误！', '请扫描箱子唛头条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);

            return;
        }

        if (this.state.partno == '') {
            Alert.alert('错误！', '请扫描关键部件条码。', [{ text: 'OK', onPress: () => this.refs.textInput2.focus() }]);
            return;
        }

        //判断部件是否在待扫描清单中
        if (!this.checkpartnoInList()) {
            Alert.alert('错误！', '部件【' + this.state.partno + '】不需要扫描，请知晓。', [{ text: 'OK', onPress: () => this.refs.textInput2.focus() }]);
            this.setState({ partno: '' });
            return;
        }

        //判断部件条码是否已经被采集过
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where partno='" + this.state.partno + "' and synced<>-1", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let scount = results.rows.item(0).ret;
                    if (scount >= 1) {
                        Alert.alert('错误！', '部件【' + this.state.partno + '】已扫描过!', [{ text: 'OK', onPress: () => this.refs.textInput2.focus() }]);
                        this.setState({ partno: '' });
                    } else {
                        this.scanDataAdd();
                    }
                }
            });
        }, (error) => {
            console.log(error);
            return;
        });
    }


    //提交，未扫描关键部件检查
    async submitForm_partcheck() {
        let { status, user, token } = this.props;
        let data = {
            packBarCode: this.state.boxno
        }

        if (this.state.boxno == '') {
            Alert.alert('错误！', '请扫描箱子唛头条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
            return;
        }

        //从服务器获取部件数据
        this.setState({ partcheckLoading: true });
        await HTTPPOST('/sm/partQuery', data, token)
            .then(async (res) => {
                if (res.code >= 1) {
                    //
                    let boxno = this.state.boxno;
                    let boxno_nopartial = StringUtil.cutStringTail(this.state.boxno, 4);
                    console.info("获取到服务器上的PackList数据，更新本地数据开始！");
                    await sqLite.insertData_Todo_PackList(this.state.boxno, StringUtil.cutStringTail(this.state.boxno, 4), res.message);

                    this.state.photoNeedCount = res.message;

                    let plist = [];

                    if (res.list && res.list.length >= 1) {

                        for (let index = 0; index < res.list.length; index++) {
                            let item = res.list[index];
                            plist.push({
                                boxno: boxno,
                                boxno_nopartial: boxno_nopartial,
                                partno: item.ids,
                                partname: item.name,
                                number: item.quantity,
                                innumber: item.scannedQuantity,
                                ztype: item.zt
                            });
                        }
                        console.info("获取到服务器上的PartList数据，更新本地数据开始！");
                    } else {
                        this.setState({ partlist: plist });
                        if (res.message) {
                            this.state.photoNeedCount = res.message;
                        }
                        Alert.alert('提醒', '关键部件已经装全！请继续下一步操作。');
                        this.setState({ partcheckLoading: false });
                        return
                    }
                    await sqLite.insertData_Todo_PartList(plist);

                    console.info("开始加载页面部件清单数据！");
                    this.loadPartList(boxno_nopartial);

                    this.refs.textInput2.focus();
                    ToastAndroid.show(
                        '获取未扫描关键部件清单成功，继续！',
                        ToastAndroid.LONG
                    );
                } else if (res.code == -17) {

                    let plist = [];
                    this.setState({ partlist: plist });
                    if (res.message) {
                        this.state.photoNeedCount = res.message;
                    }
                    Alert.alert('提醒', '关键部件已经装全！请继续下一步操作。');
                } else {
                    LogException('查询箱子【' + this.state.boxno + '】关键部件错误,' + res.code + ':' + res.msg);
                    Alert.alert('查询部件错误！', res.code + ':' + res.msg);
                }
                this.setState({ partcheckLoading: false });
            }).catch((error) => {
                LogException('查询箱子【' + this.state.boxno + '】关键部件异常,' + error.message);
                Alert.alert('查询部件异常', JSON.stringify(error));
                this.setState({ partcheckLoading: false });
            });

        //获取唛头已拍照数量

        //看看数据库中是否已经同步完成，如果完成，使用此数字，如果没用，使用数据库中数据。
        HTTPPOST('/sm/getPhotoNum', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    if (res.data) {
                        let dd = res.data;
                        console.info("从服务器返回照片数量!" + dd);
                        this.setState({ photoUploadCount: dd });
                    }
                } else {
                    console.log(res.msg);
                }
            }).catch((error) => {
                Alert.alert('获取服务端照片数量失败！', JSON.stringify(error));
                //console.log(error);
            });
        this.getPhotoNumSyncing(this.state.boxno);
        // let checkPhotoIsCompleted = await sqLite.checkPhotoIsCompleted(this.state.boxno);
        // console.info("是否已经传完照片？" + checkPhotoIsCompleted);
        // if (checkPhotoIsCompleted) {
        //     console.info("开始从服务器获取照片数量！");

        // } else {

        //     let dd = await sqLite.getPhotoNumByBox(this.state.boxno);
        //     console.info("未完成照片上传！" + dd);
        //     this.setState({ photoUploadCount: dd });
        // }
        //部件已扫描数量
        this.reflashTheboxScanData();
    }

    //获取本地未上传照片数量
    getPhotoNumSyncing(boxno) {
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where boxno='" + boxno + "' and synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let scount = results.rows.item(0).ret;
                    this.setState({ photoSyncCount: scount });
                }
            });
        }, (error) => {
            console.log(error);
        });
    }



    //加载待扫描部件清单
    async loadPartList(boxno_nopartial) {
        this.setState({ partlist: [] });

        await db.transaction((tx) => {
            tx.executeSql("select * from Todo_PartList where boxno_nopartial='" + boxno_nopartial + "' and scannedQuantity<quantity", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let plist = [];
                    for (let i = 0; i < len; i++) {
                        let u = results.rows.item(i);
                        plist.push({
                            partno: u.partno,
                            partname: u.partname,
                            number: u.quantity,
                            innumber: u.scannedQuantity,
                            ztype: u.ztype,
                            id: u.id
                        });
                    }
                    console.info(boxno_nopartial + 'PartList数据显示完成！');
                    this.setState({ partlist: plist });
                }
            }, (err) => {
                console.log(err);
            });
        }, (error) => {
            console.log(error);
        });
    }

    //箱子完工扫描提交
    submitForm_boxclose() {
        let { status, user, token } = this.props;
        let data = {
            code: user.code,
            packBarCode: this.state.boxno
        }

        if (this.state.boxno == '') {
            Alert.alert('错误！', '请扫描箱子唛头条码。');
            return;
        }

        if (this.state.photoUploadCount + this.state.photoSyncCount < this.state.photoNeedCount) {
            Alert.alert('错误！', '箱子照片还没拍完。应拍：' + this.state.photoNeedCount + '，已拍：' + (this.state.photoUploadCount + this.state.photoSyncCount).toString());
            return;
        }

        if (this.state.partlist.length > 0) {
            Alert.alert('错误！', '箱子部件还没扫描完成，不能完工。');
            return;
        }

        this.setState({ submitLoading_BoxClose: true });
        HTTPPOST('/sm/ExecWGSM', data, token)
            .then((res) => {
                if (res.code >= 1 && res.code != 3) {
                    // ToastAndroid.show(
                    //     '箱子【' + this.state.boxno + '】完工扫描成功，【' + res.data.extraMsg + '】！',
                    //     ToastAndroid.LONG
                    // );
                    Alert.alert('装箱完工扫描成功！', '箱子【' + this.state.boxno + '】完工扫描成功，【' + res.data.extraMsg + '】！');

                    let plist = [];
                    this.setState({ partlist: plist });
                    this.setState({ boxno: '' });
                    this.setState({ partno: '' });
                    this.setState({ theboxScanCount: 0 });
                    this.setState({ photoUploadCount: 0 });
                    this.setState({ photoSyncCount: 0 });
                    this.setState({ photoNeedCount: 0 });
                    this.refs.textInput1.focus();

                } else if (res.code == 3) {
                    ToastAndroid.show(
                        res.data.extraMsg,
                        ToastAndroid.LONG
                    );
                } else {
                    Alert.alert('装箱完工扫描错误！', res.code + ': ' + res.msg);
                }
                this.setState({ submitLoading_BoxClose: false });
            }).catch((error) => {
                Alert.alert('装箱完工扫描异常！', JSON.stringify(error));
                this.setState({ submitLoading_BoxClose: false });
            });
    }

    // showCamera() {
    //     const { navigate } = this.props.navigation;
    // }

    // showCamera() {
    //     const { navigate } = this.props.navigation;
    //     navigate('ScannerCode',
    //         {
    //             callback: (backData) => {
    //                 this.setState({
    //                     boxno: backData
    //                 });
    //             }
    //         })
    // }

    // showCamera2() {
    //     const { navigate } = this.props.navigation;
    //     navigate('ScannerCode',
    //         {
    //             callback: (backData) => {
    //                 this.setState({
    //                     partno: backData
    //                 });
    //             }
    //         })
    // }

    //装箱拍照
    takePhoto() {
        const { navigate } = this.props.navigation;
        let { status, user, token } = this.props;

        if (this.state.boxno == "") {
            Alert.alert('错误！', '请扫描箱子唛头条码。');
            return;
        }

        ImagePicker.launchCamera(photoOptions, (response) => {
            //console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri, path: response.path };

                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    avatarSource: source
                });
                let filepath = source.uri.replace('file:///storage/emulated/0', RNFS.ExternalStorageDirectoryPath);
                RNFS.exists(filepath).then(
                    (ret) => {
                        if (!ret) {
                            Alert.alert('错误', '照片未成功保存，请知晓！');
                            return;
                        }
                    }
                )

                let photodata = {
                    boxno: this.state.boxno,
                    photouri: this.state.avatarSource.uri,
                    usercode: user.code
                };
                //登记拍照数据
                sqLite.insertData_ScanPhotoTake(photodata);
                let updatephotoCount = this.state.photoSyncCount + 1;
                this.setState({
                    photoSyncCount: updatephotoCount
                });
            }
        });
    }

    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }
    render() {
        this.props.navigation.navigate('DrawerClose');

        return (
            <ScrollView>
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '装箱完工扫描', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>


                    <WhiteSpace />


                    <Input ref="textInput1"
                        selectTextOnFocus={true}
                        type="text" value={this.state.boxno}
                        onChangeText={this.checkboxno}
                        onSubmitEditing={this.submitForm_partcheck.bind(this)}
                        autoFocus={this.state.boxno_focused}
                        style={styles.inputS}
                        width={SCREEN_WIDTH - 70}
                        label="整箱唛头码："
                    />
                    {/* <Icon
                                    reverse
                                    name='md-qr-scanner'
                                    type='Ionicons'
                                    color='#333'
                                    size={24}
                                    style={{ width: 20, paddingTop: 10, paddingLeft: 0, marginLeft: 0, }}
                                    onPress={this.showCamera.bind(this)}
                                /> */}



                    <WhiteSpace />
                    <Input ref="textInput2"
                        selectTextOnFocus={true}
                        type="text" value={this.state.partno}
                        onChangeText={this.checkpartno}
                        onSubmitEditing={this.submitForm_partin.bind(this)}
                        autoFocus={this.state.partno_focused}
                        style={styles.inputS}
                        width={SCREEN_WIDTH - 70}
                        label="关键部件条码："
                    />
                    {/* <Icon
                                    reverse
                                    name='md-qr-scanner'
                                    type='Ionicons'
                                    color='#333'
                                    size={24}
                                    style={{ width: 20, paddingTop: 10, paddingLeft: 0, marginLeft: 0, }}
                                    onPress={this.showCamera2.bind(this)}
                                /> */}

                    <Flex style={{ padding: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>待装箱关键部件：</Text>
                        <Button buttonStyle={styles.searchbtn}
                            backgroundColor='#AAA' activeOpacity={1}
                            onPress={this.submitForm_partcheck.bind(this)}
                            title='刷新'
                            loading={this.state.partcheckLoading}
                        />

                        <TimerScanDataSync token={this.props.token} />

                    </Flex>

                    <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>

                        {
                            this.state.partlist.map((l) => (
                                <ListItem

                                    key={l.partno}
                                    title={l.partno + ' ' + l.partname}
                                    subtitle={'数量：' + l.number + '，已装箱数量：' + l.innumber + ',类型：' + l.ztype}

                                    containerStyle={{ padding: 5, margin: 0, marginBottom: 10 }}
                                />
                            ))
                        }

                    </ScrollView>



                    <Flex justify="between" >
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm_partin.bind(this)}
                            loading={this.state.submitLoading_PartIn}
                            title={'部件确认(' + this.state.theboxScanCount + ')'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.takePhoto.bind(this)}
                            loading={this.state.submitLoading_uploadPhoto}
                            title={'拍照(' + (this.state.photoUploadCount + this.state.photoSyncCount).toString() + '/' + this.state.photoNeedCount + ')'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm_boxclose.bind(this)}
                            loading={this.state.submitLoading_BoxClose}
                            title='完工' />
                    </Flex>
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
)(ScanWoBoxClose)


const styles = StyleSheet.create({
    body: {
        backgroundColor: '#FFF',
    },
    container: {


    },
    headercontainer: {
        marginTop: 0,
        paddingTop: 0,
        height: 50,

    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 40,
    },
    textIconInput2: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
    },

    partlistclass: {

        padding: 5,

        height: SCREEN_HEIGHT - 330,

    }, btngroup: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        top: SCREEN_HEIGHT - 150,
        marginLeft: "auto",
        marginRight: "auto",
        width: SCREEN_WIDTH - 30,
        backgroundColor: '#FFF',
        paddingTop: 10,
        paddingBottom: 20,
    },
    keypartsearch: {
        paddingTop: 10,
        paddingLeft: 10,
        flexDirection: 'row',
        paddingBottom: 0,
        marginBottom: -15,
    },
    searchbtn: {
        height: 25,
        width: 60,
        marginRight: 10
    },
    syncbtn: {

    }
});