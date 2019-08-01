import React from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid, FlatList, ScrollView, TouchableHighlight, TextInput } from 'react-native';
import { Input, Button, Header, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../api/HttpRequest';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { connect } from 'react-redux';

import DeviceStorage from '../api/DeviceStorage';
import StringUtil from '../api/StringUtil';
import ModalDropdown from 'react-native-modal-dropdown';

import Config from 'react-native-config';
var RNFS = require('react-native-fs');

import SQLite from '../api/SQLite';
var sqLite = new SQLite();
var db;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


class SyncManger extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            boxno: '',
            boxno_valid: true,
            boxno_emessage: '',
            boxno_focused: false,

            partno: '',
            partno_valid: true,
            partno_emessage: '',
            partno_focused: false,

            photo: null,
            photoUploadCount: 0,

            scrollMode: 'always',
            submitLoading_PartIn: false,
            submitLoading_BoxClose: false,
            submitLoading_uploadPhoto: false,
            searchloading: false,
            partcheckLoading: false, //刷新按钮的loding状态

            //syncCount: 0, //未同步数量
            theboxScanCount: 0,//当前箱子扫描数量
            avatarSource: null, //

            //DB重置
            reset_DB_Loading: false,
            tablelist: [{
                name: 'ScanData_PartInBox',
                label: '装箱部件扫描记录'
            }, {
                name: 'ScanData_PhotoTake',
                label: '装箱拍照上传记录'
            }, {
                name: 'ScanData_PartInWo',
                label: '工单完工部件扫描记录'
            }, {
                name: 'ScanData_PhotoInWo',
                label: '工单完工照片上传记录'
            }],
            stablename: '',
            datalist: []
        };
        //const navigate = this.props.navigation;
        this.checkboxno = this.checkboxno.bind(this);
    }
    checkboxno(val) {
        this.setState({ boxno: val });
    }

    async reset_DB() {
        this.setState({ reset_DB_Loading: true });

        //判断是否数据都同步完成，只有完成才可以重置数据库
        let scount = 0;
        await db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where synced=0 or synced=-1", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where synced=0 or synced=-1", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });
            tx.executeSql("select count(*) as ret from ScanData_PartInWo where synced=0 or synced=-1", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });
            tx.executeSql("select count(*) as ret from ScanData_PhotoInWo where synced=0 or synced=-1", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });

        }, (error) => {
            console.log(error);
            sqLite.dropTable_ScanPartInBox();
            sqLite.dropTable_ForWoComplete();
            sqLite.createTable_ScanPartInBox();
            sqLite.createTable_ForWoComplete();
            return;
        });

        if (scount >= 1) {
            Alert.alert('错误！', '还未同步的数据，请先上传数据，谢谢!', [{ text: 'OK', onPress: () => { } }]);
        } else {
            sqLite.dropTable_ScanPartInBox();
            sqLite.dropTable_ForWoComplete();
            sqLite.createTable_ScanPartInBox();
            sqLite.createTable_ForWoComplete();
            ToastAndroid.show(
                '数据库重建完成！',
                ToastAndroid.LONG
            );
        }

        this.setState({ reset_DB_Loading: false });
    }


    select1_renderButtonText(rowData) {
        const { label, name } = rowData;
        return `${label} - ${name}`;
    }

    select1_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={styles.selectrow}>
                    <Text>
                        {`${rowData.label} (${rowData.name})`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
    select1_onSelect(idx, value) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //Alert.alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);
        this.setState({ stablename: value.name });
    }

    //在页面组件，控件渲染后触发
    componentDidMount() {

        //开启数据库
        if (!db) {
            db = sqLite.open();
        }
        this.props.navigation.navigate('DrawerClose');
    }

    //提交扫描结果
    submitForm() {
        let databoxno = this.state.boxno;
        let tablename = this.state.stablename;
        if (databoxno == "" || tablename == "") {
            ToastAndroid.show(
                '错误，缺少数据！未选择数据表或对应的查询字段为空！',
                ToastAndroid.LONG
            );
            return;
        }
        let searchsql = "";
        if (tablename == "ScanData_PartInBox") {
            searchsql = "select id,partno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PartInBox where boxno='" + databoxno + "' order by id desc "
        } else if (tablename == "ScanData_PhotoTake") {
            searchsql = "select id,boxno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PhotoTake where boxno='" + databoxno + "' order by id desc "
        }
        else if (tablename == "ScanData_PartInWo") {
            searchsql = "select id,partno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PartInWo where wono='" + databoxno + "' order by id desc "
        }
        else if (tablename == "ScanData_PhotoInWo") {
            searchsql = "select id,wono as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PhotoInWo where wono='" + databoxno + "' order by id desc "
        }
        else {
            ToastAndroid.show(
                '错误！请选择数据表',
                ToastAndroid.LONG
            );
            return;
        }


        this.setState({ searchloading: true });
        db.transaction((tx) => {
            tx.executeSql(searchsql, [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let plist = [];
                    for (let i = 0; i < len; i++) {
                        let u = results.rows.item(i);
                        plist.push(u);
                    }

                    this.setState({ datalist: plist });
                    this.setState({ searchloading: false });
                }
            });
        }, (error) => {
            console.log(error);
            this.setState({ searchloading: false });
            return;
        });
    }

    searcherrdata() {
        let tablename = this.state.stablename;
        if (tablename == "") {
            ToastAndroid.show(
                '错误，缺少数据！未选择数据表！',
                ToastAndroid.LONG
            );
            return;
        }
        let searchsql = "";
        if (tablename == "ScanData_PartInBox") {
            searchsql = "select id,partno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PartInBox where synced=-1 order by id desc "
        } else if (tablename == "ScanData_PhotoTake") {
            searchsql = "select id,boxno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PhotoTake where synced=-1 order by id desc "
        }
        else if (tablename == "ScanData_PartInWo") {
            searchsql = "select id,partno as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PartInWo where synced=-1 order by id desc "
        }
        else if (tablename == "ScanData_PhotoInWo") {
            searchsql = "select id,wono as title,synced as status,sync_ret+' '+sync_retmsg as detail from ScanData_PhotoInWo where synced=-1 order by id desc "
        }
        else {
            ToastAndroid.show(
                '错误！请选择数据表',
                ToastAndroid.LONG
            );
            return;
        }

        db.transaction((tx) => {
            tx.executeSql(searchsql, [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let plist = [];
                    for (let i = 0; i < len; i++) {
                        let u = results.rows.item(i);
                        plist.push(u);
                    }

                    this.setState({ datalist: plist });
                }
                ToastAndroid.show(
                    '查询异常数据成功！',
                    ToastAndroid.LONG
                );
            });
        }, (error) => {
            console.log(error);
            ToastAndroid.show(
                '异常！' + error.message,
                ToastAndroid.LONG
            );
            return;
        });
    }

    updateerrdata() {
        let tablename = this.state.stablename;
        if (tablename == "") {
            ToastAndroid.show(
                '错误，缺少数据！未选择数据表！',
                ToastAndroid.LONG
            );
            return;
        }
        let searchsql = "";
        if (tablename == "ScanData_PartInBox") {
            searchsql = "update ScanData_PartInBox set  synced=0 where synced=-1 or synced is null"
        } else if (tablename == "ScanData_PhotoTake") {
            searchsql = "update ScanData_PhotoTake set synced=0 where synced=-1 or synced is null"
        }
        else if (tablename == "ScanData_PartInWo") {
            searchsql = "update ScanData_PartInWo set synced=0 where synced=-1 or synced is null"
        }
        else if (tablename == "ScanData_PhotoInWo") {
            searchsql = "update ScanData_PhotoInWo set synced=0 where synced=-1 or synced is null"
        }
        else {
            ToastAndroid.show(
                '错误！请选择数据表',
                ToastAndroid.LONG
            );
            return;
        }

        db.transaction((tx) => {
            tx.executeSql(searchsql, [], () => {
                ToastAndroid.show(
                    '异常数据重置成功！',
                    ToastAndroid.LONG
                );
            });
        }, (error) => {
            console.log(error);
            ToastAndroid.show(
                '异常！' + error.message,
                ToastAndroid.LONG
            );
            return;
        });
    }


    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }


    //复制数据库文件
    copyDBFile() {

        const dbpath = RNFS.DocumentDirectoryPath.replace("/files", "/databases");
        const path = dbpath + "/XioLiftMES.db";
        const appdir = RNFS.ExternalStorageDirectoryPath + '/' + Config.Log_Dir;
        const path1 = appdir + "/XioLiftMES.db";
        return RNFS.copyFile(path, path1)
            .then((result) => {
                ToastAndroid.show(
                    '复制数据库文件到日志目录成功！',
                    ToastAndroid.LONG
                );
                console.log("复制数据库文件到日志目录成功", result);
            })
            .catch((err) => {
                console.log(err.message);
                ToastAndroid.show(
                    err.message,
                    ToastAndroid.LONG
                );
            });
    }

    componentWillUnmount() {
        this.refs.select1.hide();
    }
    render() {

        return (
            <ScrollView>
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '同步数据查询', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>


                    <View style={{ padding: 0 }}>
                        <Text>数据表：</Text>
                        <ModalDropdown options={this.state.tablelist}
                            style={styles.Selecter}
                            textStyle={styles.SelecterText}
                            dropdownStyle={styles.SelecterDropDown}
                            ref="select1"
                            renderButtonText={(rowData) => this.select1_renderButtonText(rowData)}
                            renderRow={this.select1_renderRow.bind(this)}
                            onSelect={(idx, value) => this.select1_onSelect(idx, value)}
                        />
                    </View>
                    <Text>查询：</Text>
                    <TextInput ref="textInput1"
                        //="整箱唛头码："
                        //type="text"
                        value={this.state.boxno}
                        onChangeText={this.checkboxno}
                        onSubmitEditing={this.submitForm.bind(this)}
                        autoFocus={this.state.boxno_focused}
                        style={styles.inputS}
                        //containerStyle={styles.inputS}
                        //inputContainerStyle={{ padding: 0, margin: 0 }}
                        keyboardType="email-address"
                    />

                    <ScrollView style={styles.partlist}>
                        {
                            this.state.datalist.map((l) => (
                                <ListItem
                                    roundAvatar={false}
                                    key={l.id}
                                    title={l.title + ' 状态：' + l.status}
                                    subtitle={'详情：' + l.detail}
                                    hideChevron={true}
                                    containerStyle={{ padding: 0, margin: 0 }}
                                />
                            ))
                        }
                        {
                            this.state.datalist.length <= 0 ? <Text>查无记录！</Text> : null
                        }
                    </ScrollView>

                    <View style={styles.btngroup}>

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.searchloading}
                            title={'查询数据'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.copyDBFile.bind(this)}
                            title={'复制数据'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.reset_DB.bind(this)}
                            loading={this.state.reset_DB_Loading}
                            title={'重建数据表'} />
                    </View>
                    <View style={styles.btngroup}>

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.searcherrdata.bind(this)}
                            title={'查询异常数据'} />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.updateerrdata.bind(this)}
                            title={'重置异常数据'} />
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
        token: state.loginIn.token
    })
)(SyncManger)


const styles = StyleSheet.create({
    body: {
        flex: 1, backgroundColor: '#FFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',

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
        height: 40,
    },
    textIconInput2: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        backgroundColor: '#fff',
        margin: 0,
        padding: 0,
        borderBottomColor: '#666666',
        borderBottomWidth: 1
    },

    partlist: {
        paddingTop: 0,
        paddingBottom: 0,
        height: SCREEN_HEIGHT - 290,
    },
    btngroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        marginLeft: "auto",
        marginRight: "auto",
        width: SCREEN_WIDTH - 20,
        paddingTop: 10,
    },
    keypartsearch: {
        paddingTop: 10,
        paddingLeft: 20,
        flexDirection: 'row',
        paddingBottom: 0,
        marginBottom: -15,
    },
    searchbtn: {
        height: 20,
        width: 60,
    },
    syncbtn: {
        height: 20,
        width: 80,
        alignSelf: 'flex-end'
    },
    Selecter: {
        height: 30,
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
    selectrow: {
        padding: 5,
    },
    SelecterDropDown: {
        width: SCREEN_WIDTH - 110,
        height: 120,
    }

});