import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, TouchableHighlight, NativeModules } from 'react-native';
import { Input, Button, Header, CheckBox } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex, List, Switch } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../../api/HttpRequest';
import ModalDropdown from 'react-native-modal-dropdown';
import StringUtil from '../../api/StringUtil';
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
import { LogInfo, LogError, LogException } from '../../api/Logger';
import { ProcessingManager } from 'react-native-video-processing';
import BackgroundJob from "react-native-background-job";
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
var RNFS = require('react-native-fs');
var task_oqc_videouploading = false;

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
const videoOptions = {
    title: '请选择',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: '拍照',
    chooseFromLibraryButtonTitle: '选择相册',
    videoQuality: 'high',
    allowsEditing: false,
    noData: true,
    mediaType: 'video',
    width: 600,
    height: 800,
    durationLimit: 120, //时间上限
    storageOptions: {
        skipBackup: true,
        path: 'oqcvideo/' + StringUtil.getNowDate(),
        cameraRoll: true,
        waitUntilSaved: true,
    },
};

const compressOptions = {
    width: 600,
    height: 800,
    bitrateMultiplier: 10,
    // saveToCameraRoll: true, // default is false, iOS only
    // saveWithCurrentDate: true, // default is false, iOS only
    minimumBitrate: 300000,
    removeAudio: true, // default is false
}


class FQCLianDong extends React.Component {
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

            checked: false,
            photouploaded: 0,
            photoloading: false,

            videoloading: false,
            videouploaded: 0,
        };
        //const navigate = this.props.navigation;

        this.checkorderno = this.checkorderno.bind(this);

    }

    onSwitchChange(index, obj, event) {
        let obj1 = JSON.parse(JSON.stringify(this.state.fqcboxes));
        let newobj = obj1[index];
        if (newobj.isldhg == '不合格' || newobj.isldhg == '待检验') {
            newobj.isldhg = '合格';
        } else {
            newobj.isldhg = '不合格';
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
            if (item.isldhg != '不合格') {
                item.isldhg = '合格'
            }
        });

        let data = {
            smList: this.state.fqcboxes,
            smtype: 1,
            userCode: user.code,
            userName: user.loginName,
        }

        HTTPPOST('/sm/updateBoxHG', data, token)
            .then((res) => {
                if (res.code >= 1) {

                    this.refs.toast.show('提交联动检验结果成功！');

                    this.setState({ orderno: '' });
                    this.setState({ fqcboxes: [] });
                    this.setState({ otherboxes: [] });
                    this.refs.selectaddbox.select(-1);
                    this.refs.textInput1.focus();
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('提交联动检验结果失败', res.msg);
                }
                //this.setState({ submitLoading: false });

            }).catch((error) => {
                Alert.alert('提交联动检验结果异常', error);
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
        let theorderno = "";
        if (this.state.orderno.indexOf('  ') >= 0) {
            //扫描的信息为唛头条码
            theorderno = this.state.orderno.substring(0, this.state.orderno.indexOf('  '));
        } else {
            theorderno = this.state.orderno;
        }
        if (theorderno == "") {
            Alert.alert('错误', '请扫描合同号信息！');
            return;
        }

        let datareq = {
            hth: theorderno,
            smtype: '1', //0表示拼搭，1表示联动
            //hgtype: '',  //为空，查询待检验箱子
        }
        this.setState({ searchloading: true });
        HTTPPOST('/sm/getHTHBoxInfoAndPhoto', datareq, token)
            .then((res) => {
                if (res.code >= 1) {
                    if (res.list && res.list.length) {

                        let qcboxlist = [];
                        let otherboxlist = [];
                        res.list.forEach(qcitem => {
                            if (qcitem.isldhg && qcitem.isldhg != '免检') {
                                qcboxlist.push(qcitem);
                            } else {
                                otherboxlist.push(qcitem);
                            }
                        });

                        this.setState({ fqcboxes: qcboxlist });  //待检验箱子数据
                        this.setState({ otherboxes: otherboxlist });
                    }
                    if (res.photoNum) {
                        this.setState({ photouploaded: res.photoNum });
                    }
                    if (res.videoNum) {
                        this.setState({ videouploaded: res.videoNum });
                    }

                    this.refs.toast.show('合同【' + theorderno + '】待检验箱子，接收成功！');
                    this.setState({ searchloading: false });
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('错误', '合同[' + theorderno + ']，' + res.msg, [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
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
    async getphoto() {
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
        await HTTPPOST_Multipart('/sm/uploadLDSMPhotoParam', formdata, token)
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


    //获取视频
    async getvideo() {
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

        this.setState({ videoloading: true });
        ImagePicker.launchCamera(videoOptions, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                this.setState({ videoloading: false });
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                this.setState({ videoloading: false });
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                this.setState({ videoloading: false });
            }
            else {
                LogInfo('视频拍摄完成！地址：' + response.uri);

                this.uploadvideo(theorderno, response.uri);
                //this.refs.toast.show('获取照片【' + image.path + '】成功！');
            }

        });
    }

    uploadvideo(orderno, videopath) {
        let { status, user, token } = this.props;

        let formdata = new FormData();
        formdata.append('usercode', user.code);

        formdata.append('HTH', orderno);

        let date = new Date();
        let currentTimestamp = date.getTime();
        let JobKeyStr = "OQCTask_UploadVideo_" + currentTimestamp;

        RNFS.stat(videopath).then((retobj) => {
            // console.log('文件路径：' + retobj.originalFilepath);
            LogInfo('上传成品检验（联动）视频开始压缩，', '开始压缩...' + retobj.originalFilepath);
            ProcessingManager.compress(retobj.originalFilepath, compressOptions)
                .then((data) => {

                    LogInfo('上传成品检验（联动）视频压缩完成，', '压缩完成...');
                    //console.log('压缩成功!' + data);
                    BackgroundJob.register({
                        jobKey: JobKeyStr,
                        job: () => {
                            this.uploadvideoBackTask(formdata, JobKeyStr, data.source);
                        }
                    });

                    BackgroundJob.schedule({
                        jobKey: JobKeyStr,
                        notificationTitle: "Notification title",
                        notificationText: "Notification text",
                        allowWhileIdle: true,
                        allowExecutionInForeground: true,
                        period: 1000
                    });

                    let newvideouploaded = this.state.videouploaded + 1;
                    this.setState({ videouploaded: newvideouploaded });
                    this.setState({ videoloading: false });
                    this.refs.toast.show('上传视频【' + videopath + '】成功！');


                }).catch((err) => {
                    //Alert.alert('压缩视频文件异常！', '异常原因：' + err);
                    LogError('压缩视频文件异常！', '异常原因：' + err);
                    //BackgroundJob.cancel({ jobKey: JobKey });
                    //task_oqc_videouploading = false;
                    this.setState({ videoloading: false });
                });
            // console.log('视频压缩完成！');
        }).catch((err2) => {
            //Alert.alert('获取视频文件信息异常！', '异常原因：' + err2);
            LogException('获取视频文件信息异常！', '异常原因：' + err2);
            //BackgroundJob.cancel({ jobKey: JobKey });
            //task_oqc_videouploading = false;
            this.setState({ videoloading: false });
        });




        //console.log(videopath);


        //开始上传
    }

    uploadvideoBackTask(formdata, JobKey, videopath) {
        let { status, user, token } = this.props;
        if (task_oqc_videouploading == false) {
            LogInfo('上传成品检验（联动）视频开始上传，', '开始上传文件...');
            task_oqc_videouploading = true;

            let videofile = { uri: videopath, type: 'application/octet-stream', name: 'fqcvideo_' + '.3gp' };
            formdata.append('file', videofile);


            HTTPPOST_Multipart('/sm/uploadLDSMVideoParam', formdata, token, '1', 1200 * 1000)
                .then((res) => {
                    if (res.code > 0) {
                        //this.setState({ videouploaded: res.data });
                        //this.refs.toast.show('上传视频【' + videopath + '】成功！');
                        LogInfo('上传成品检验（联动）视频成功，', '返回值：' + res.code);


                    } else {
                        LogError('上传成品检验（联动）视频错误，', '错误：' + res.code + ':' + res.msg);
                        //Alert.alert('错误', '上传视频【' + videopath + '】失败！' + res.code + ':' + res.msg);

                    }
                    BackgroundJob.cancel({ jobKey: JobKey });
                    task_oqc_videouploading = false;
                    //this.setState({ videoloading: false });
                }).catch((err) => {
                    LogException('上传成品检验（联动）视频异常，', '上传视频【' + JSON.stringify(formdata) + '异常信息：' + err);
                    //Alert.alert('上传联动视频异常', '上传视频【' + videopath + '】异常！' + err);
                    //this.setState({ videoloading: false });
                    BackgroundJob.cancel({ jobKey: JobKey });
                    task_oqc_videouploading = false;
                })
        }

    }

    render() {
        return (
            <ScrollView >
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '成品联动检验', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank size='sm'>
                    <WhiteSpace size='sm' />
                    <View style={styles.textIconInput}>
                        <Input ref="textInput1"
                            label="检验合同号："
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
                    <WhiteSpace size='sm' />
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
                                                {l.isldhg == '不合格' || l.isldhg == '待检验' ? ' [不合格]' : ' [合格]'}
                                                <Switch
                                                    color="red"
                                                    checked={l.isldhg == '不合格' || l.isldhg == '待检验' ? true : false}
                                                    onChange={this.onSwitchChange.bind(this, index, l)}
                                                /></Text>
                                        }
                                    >
                                        {l.boxName}
                                        {<Text style={{ fontSize: 10 }}>
                                            {l.mt + '  ' + l.ldremark}</Text>
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

                        <ModalDropdown options={this.state.otherboxes.length >= 1 ? this.state.otherboxes : null}
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
                    <WhiteSpace size='sm' />
                    <Flex justify="between">
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={() => this.getphoto()}
                            loading={this.state.photoloading}
                            title={'拍照(' + this.state.photouploaded + ')'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.getboxes.bind(this)}
                            loading={this.state.searchloading}
                            title='查询检验项' />
                    </Flex>
                    <WhiteSpace size='sm' />
                    <Flex justify="between">
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={() => this.getvideo()}
                            loading={this.state.videoloading}
                            title={'拍视频(' + this.state.videouploaded + ')'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='提交检验结果' />
                    </Flex>
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
)(FQCLianDong)


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
        height: SCREEN_HEIGHT - 365,
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
    }
});