import React from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid, FlatList, ScrollView, NativeModules } from 'react-native';
import { Input, Button, ListItem, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';

import { connect } from 'react-redux';
import StringUtil from '../../api/StringUtil';

import TimerScanDataSync_WoScan from '../../viewc/TimerScanDataSync_WoScan';
import ImagePicker from 'react-native-image-picker';

import SQLite from '../../api/SQLite';
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

class WoClose extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            worksiteno: '',
            worksitename: '',
            worksite_focused: true,

            boxno: '',
            boxno_valid: true,
            boxno_emessage: '',
            boxno_focused: false,

            wodata: [],  ///操作的SAP工单数据
            wono: [],    ///SAP的工单号数据

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

            partlistLoading: false, //刷新按钮的loding状态

            //syncCount: 0, //未同步数量
            theboxScanCount: 0,//当前箱子扫描数量
            avatarSource: null, //

        };
        //const navigate = this.props.navigation;

        this.checkboxno = this.checkboxno.bind(this);
        this.checkpartno = this.checkpartno.bind(this);
        this.checkworksite = this.checkworksite.bind(this);


    }
    //1. 在渲染前调用,在客户端也在服务端
    async componentWillMount() {
        let { status } = this.props;
        const { navigate } = this.props.navigation;
        if (status != '1') {
            navigate('Login');
        }
        //开启数据库
        if (!db) {
            db = sqLite.open();
        }

        await sqLite.createTable_ForWoComplete();
    }

    //2. 在页面组件，控件渲染后触发
    componentDidMount() {


    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    checkworksite(val) {
        this.setState({ worksiteno: val });
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
            }
            else if (partbarcode.startsWith('3')) {
                let partcode = partbarcode.split('|')[0];
                //判断是否是指定合同的部件
                let PartPCNO = partbarcode.split('|')[1];
                let ScanPONO = this.state.boxno.split('  ')[0];
                if (PartPCNO != ScanPONO) {
                    return ""; //合同不一样，不能扫描入库
                } else {
                    return partcode.substr(16);
                }
            } else if (partbarcode.startsWith('4')) {
                let partcode = partbarcode.split('|')[0];
                return partcode.substr(16);
            }
            else {
                let partcode = partbarcode.split('|')[0];
                return partcode.substr(16);
            }
        }
    }

    //判断部件件号是否在待扫描的清单中。
    checkpartnoInList() {
        let plist = this.state.partlist;
        let thepno = this.getpartnoByPartBarcode();
        if (thepno == "") {
            return false;
        }

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



    //往数据库新增扫描记录
    async scanDataAdd() {
        let { status, user, token } = this.props;
        //=========
        var scanDatas = [];
        let scandata = {};


        scandata.code = user.code;
        //scandata.boxno = this.state.boxno;
        scandata.partno = this.state.partno;

        let scanpartinfo = await this.getPartInfoInList();
        scandata.ztype = scanpartinfo.ztype;
        scandata.id = scanpartinfo.id;
        scandata.wono = scanpartinfo.wono;
        if (scanpartinfo.ztype.trim() == 'C+') {
            scandata.number = 1;
        } else {
            scandata.number = scanpartinfo.number;
        }

        scanDatas.push(scandata)
        //将扫描数据存入数据库
        await sqLite.insertData_ScanPartInWo(scanDatas);

        ToastAndroid.show(
            '关键部件【' + this.state.partno + '】插入成功，请继续！',
            ToastAndroid.LONG
        );

        //重新加载待扫描部件清单
        //console.info("扫描关键部件完成，重新加载部件列表！");

        await this.loadPartList(this.state.wono);

        this.setState({ partno: '' });
        this.refs.textInput2.focus();
        // this.reflashNuSyncData(); //刷新未同步的扫描数据记录
        this.reflashTheboxScanData();
    }

    //刷新未同步的扫描数据记录


    //刷新未同步的扫描数据记录
    reflashTheboxScanData() {
        let wonolist = this.state.wono;
        let thewono = '';
        if (wonolist.length == 0) {
            //没有工单
            return;
        }
        wonolist.forEach(woitem => {
            if (thewono == '') {
                thewono = "'" + woitem + "'"
            } else {
                thewono = thewono + ",'" + woitem + "'"
            }
        });
        //查询

        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInWo where wono in(" + thewono + ")", [], (tx, results) => {
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

        if (this.state.boxno == '' || this.state.wodata.length == 0) {
            Alert.alert('错误！', '请扫描唛头条码或工单条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
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
            tx.executeSql("select count(*) as ret from ScanData_PartInWo where partno='" + this.state.partno + "' and (synced=1 or synced=0)", [], (tx, results) => {
                let len = results.rows.length;
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


    //获取工单对应的关键部件清单
    getwopartlist() {
        let { status, user, token } = this.props;
        let orderno = this.state.boxno;
        if (this.state.boxno.indexOf('  ') >= 0) {
            //扫描的信息为唛头条码
            orderno = this.state.boxno.substring(0, this.state.boxno.indexOf('  '));
        } else {
            orderno = this.state.boxno
        }
        let data = {
            gwdm: this.state.worksiteno,
            hth: orderno
        }

        if (!data.gwdm || !data.hth || data.gwdm == '' || data.hth == '') {
            Alert.alert('错误！', '请扫描合同条码或箱子唛头条码。', [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
            return;
        }

        //从服务器获取工单号
        this.setState({ partlistLoading: true });
        HTTPPOST('/sm/getGDXX', data, token)
            .then(async (res) => {
                if (res.code >= 1) {
                    //获取工单成功
                    if (res.list.length >= 1) {

                        this.setState({ wodata: res.list });

                        //获取工单对应的关键部件清单数据
                        let wono = [];
                        res.list.forEach(woitem => {
                            if (wono.indexOf(woitem.aufnr) == -1) {
                                wono.push(woitem.aufnr);
                            }
                        });
                        this.setState({ wono: wono });
                        this.setState({ partlistLoading: false });
                        this.getPartList(wono);
                        console.log('获取工单数据成功！');


                        let reqdata2 = {
                            aufnr: this.state.wono[0]
                        };
                        //看看数据库中是否已经同步完成，如果完成，使用此数字，如果没用，使用数据库中数据。
                        HTTPPOST('/sm/GetGDPhotoUploadNumber', reqdata2, token)
                            .then((res) => {
                                if (res.code >= 1) {
                                    if (res.data) {
                                        let dd = res.data;
                                        console.info("从服务器返回已上传的照片数量!" + dd);
                                        this.setState({ photoUploadCount: dd });
                                    }
                                } else {
                                    console.log(res.msg);
                                }
                            }).catch((error) => {
                                Alert.alert('获取服务端照片数量失败！', JSON.stringify(error));
                                //console.log(error);
                            });
                        this.getPhotoNumSyncing(this.state.wono);

                    } else {
                        Alert.alert('查询工单数据错误！', res.code + ': 没有返回工单数据，' + res.msg);
                        this.setState({ partlistLoading: false });
                    }
                } else {
                    Alert.alert('查询工单数据错误！', res.code + ':' + res.msg);
                    this.setState({ partlistLoading: false });
                }

            }).catch((error) => {
                Alert.alert('查询工单数据异常', JSON.stringify(error));
                this.setState({ partlistLoading: false });
            });

    }

    //获取本地未上传照片数量
    getPhotoNumSyncing(wonolist) {
        let thewono = '';
        wonolist.forEach(woitem => {
            if (thewono == '') {
                thewono = "'" + woitem + "'"
            } else {
                thewono = thewono + ",'" + woitem + "'"
            }
        });
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoInWo where wono in (" + thewono + ") and synced=0", [], (tx, results) => {
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
    async getPartList(wonolist) {
        let { status, user, token } = this.props;
        let data = {
            aufnrlist: wonolist
        };
        this.setState({ partlist: [] });
        this.setState({ partlistLoading: true });
        await HTTPPOST('/sm/getGJBJInfo', data, token)
            .then(async (res) => {
                if (res.code >= 1) {
                    //获取工单成功
                    if (res.list.length >= 1) {
                        //this.setState({ partlist: res.list });
                        let plist = [];
                        for (let index = 0; index < res.list.length; index++) {
                            let item = res.list[index];
                            plist.push({
                                wono: item.aufnr,
                                partno: item.matnr_S,
                                partname: item.maktx_S,
                                number: item.bdmng,
                                innumber: item.smCount,
                                ztype: item.typeName
                            });
                        }
                        await sqLite.insertData_Todo_PartListForWo(wonolist, plist);
                        this.loadPartList(wonolist);
                    } else {

                        this.setState({ partlist: [] });
                        ToastAndroid.show(
                            '查询工单无未扫描的关键部件，请继续！',
                            ToastAndroid.LONG
                        );
                    }
                } else {
                    Alert.alert('查询工单关键部件数据错误！', res.code + ':' + res.msg);
                }
                this.setState({ partlistLoading: false });
            }).catch((error) => {
                Alert.alert('查询工单关键部件数据异常', JSON.stringify(error));
                this.setState({ partlist: [] });
                this.setState({ partlistLoading: false });
            });
    }

    //加载待扫描部件清单
    async loadPartList(wonolist) {


        let thewono = '';
        wonolist.forEach(woitem => {
            if (thewono == '') {
                thewono = "'" + woitem + "'"
            } else {
                thewono = thewono + ",'" + woitem + "'"
            }
        });
        this.setState({ partlist: [] });


        await db.transaction((tx) => {
            tx.executeSql("select * from Todo_PartListForWo where wono in(" + thewono + ") and scannedQuantity<quantity", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let plist = [];
                    for (let i = 0; i < len; i++) {
                        let u = results.rows.item(i);
                        plist.push({
                            wono: u.wono,
                            partno: u.partno,
                            partname: u.partname,
                            number: u.quantity,
                            innumber: u.scannedQuantity,
                            ztype: u.ztype,
                            id: u.id
                        });
                    }
                    this.setState({ partlist: plist });
                    ToastAndroid.show(
                        '查询工单未扫描的关键部件成功，请继续！',
                        ToastAndroid.LONG
                    );
                    this.refs.textInput2.focus();
                } else {
                    ToastAndroid.show(
                        '查询工单无未扫描的关键部件，请继续！',
                        ToastAndroid.LONG
                    );
                }
            }, (err) => {
                console.log(err);
            });
        }, (error) => {
            console.log(error);
        });
    }

    //箱子完工扫描提交
    submitForm_woclose() {
        let { status, user, token } = this.props;
        let wowgifo = "";
        this.state.wodata.forEach(woelement => {
            wowgifo = wowgifo + woelement.id08 + ":" + woelement.gamng + ":" + "0;"
        });

        let data = {
            code: user.code,
            wginfo: wowgifo
        }
        //工单完工信息格式，案例：“工单号:完工数量:报废数量;工单号2:完工数2:报废数2”
        if (this.state.wodata.length == 0) {
            Alert.alert('错误！', '请扫描箱子唛头条码或工单条码。');
            return;
        }

        if (this.state.photoUploadCount + this.state.photoSyncCount < this.state.photoNeedCount) {
            Alert.alert('错误！', '工单完工照片还没拍完。应拍：' + this.state.photoNeedCount + '，已拍：' + (this.state.photoUploadCount + this.state.photoSyncCount).toString());
            return;
        }

        if (this.state.partlist.length > 0) {
            Alert.alert('错误！', '工单关键部件还没扫描完成，不能完工。');
            return;
        }

        this.setState({ submitLoading_BoxClose: true });
        HTTPPOST('/sm/GDWG', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    // ToastAndroid.show(
                    //     '工单【' + this.state.boxno + '】完工扫描成功！' + res.msg,
                    //     ToastAndroid.LONG
                    // );
                    Alert.alert('工单完工扫描成功！', '工单【' + this.state.boxno + '】完工扫描成功！' + res.msg);
                    this.setState({ partlist: [] });
                    this.setState({ wodata: [] });
                    this.setState({ wono: [] });
                    this.setState({ boxno: '' });
                    this.setState({ partno: '' });
                    this.setState({ theboxScanCount: 0 });
                    this.setState({ photoUploadCount: 0 });
                    this.setState({ photoSyncCount: 0 });
                    this.setState({ photoNeedCount: 0 });
                    this.refs.textInput1.focus();

                } else {
                    Alert.alert('工单完工扫描错误！', res.code + ': ' + res.msg);
                }
                this.setState({ submitLoading_BoxClose: false });
            }).catch((error) => {
                Alert.alert('工单完工扫描异常！', JSON.stringify(error));
                this.setState({ submitLoading_BoxClose: false });
            });
    }

    //检查工作站点
    submitForm_worksitecheck() {
        let { status, user, token } = this.props;
        // let data = {
        //     ZDCode: 
        // }
        HTTPPOST('/sm/getLineBodyByZDCode', this.state.worksiteno, token)
            .then((res) => {
                if (res.code >= 1) {
                    let sitedata = res.list[0];
                    this.setState({ worksitename: '(' + sitedata.zdname + ')' })
                    this.setState({ photoNeedCount: sitedata.minPhotos })
                    ToastAndroid.show(
                        '站点信息获取成功！',
                        ToastAndroid.LONG
                    );
                    // NativeModules.BaiduTts.speak('站点信息获取成功');
                    this.refs.textInput1.focus();
                } else {
                    Alert.alert('站点信息获取错误！', res.code + ': ' + res.msg);
                }
            }).catch((error) => {
                Alert.alert('站点信息获取异常！', JSON.stringify(error));
            });

    }

    //装箱拍照
    takePhoto() {
        const { navigate } = this.props.navigation;
        let { status, user, token } = this.props;

        if (this.state.wono.length == 0) {
            Alert.alert('无对应工单错误！', '请扫描箱子唛头条码或工单条码。');
            this.refs.textInput1.focus();
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

                let photodata = {
                    wono: this.state.wono[0],
                    photouri: this.state.avatarSource.uri,
                    usercode: user.code
                };
                //登记拍照数据
                sqLite.insertData_ScanPhotoTakeForWo(photodata);
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
                    centerComponent={{ text: '工单完工扫描', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>

                    <WhiteSpace />
                    <Flex >
                        <Flex.Item>
                            <Input ref="textInput0"
                                selectTextOnFocus={true}
                                type="text" value={this.state.worksiteno}
                                onChangeText={this.checkworksite}
                                onSubmitEditing={this.submitForm_worksitecheck.bind(this)}
                                autoFocus={this.state.worksite_focused}
                                label={"工作站点：" + this.state.worksitename}
                                labelStyle={styles.myLabelStyle}
                            />
                        </Flex.Item>
                    </Flex>
                    <WhiteSpace />
                    <Input ref="textInput1"
                        selectTextOnFocus={true}
                        type="text" value={this.state.boxno}
                        onChangeText={this.checkboxno}
                        onSubmitEditing={this.getwopartlist.bind(this)}
                        autoFocus={this.state.boxno_focused}
                        style={styles.inputS}
                        label="合同条码或唛头码："
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
                            onPress={this.getwopartlist.bind(this)}
                            title='刷新'
                            loading={this.state.partlistLoading}
                        />

                        <TimerScanDataSync_WoScan token={this.props.token} />

                    </Flex>

                    <ScrollView style={styles.partlistclass}>

                        {
                            this.state.partlist.map((l) => (
                                <ListItem

                                    key={l.partno}
                                    title={l.partno + ' ' + l.partname}
                                    subtitle={'数量：' + l.number + '，已扫描数量：' + l.innumber + ',类型：' + l.ztype}

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
                            onPress={this.submitForm_woclose.bind(this)}
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
)(WoClose)


const styles = StyleSheet.create({
    body: {
        backgroundColor: '#FFF',
    },
    container: {


    },
    myLabelStyle: {

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
        height: 20,
    },
    partlistclass: {
        padding: 5,
        height: SCREEN_HEIGHT - 415,
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