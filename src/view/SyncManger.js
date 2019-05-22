import React from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid, FlatList, ScrollView } from 'react-native';
import { Input, Button, Header, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST, HTTPPOST_Multipart } from '../api/HttpRequest';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { connect } from 'react-redux';

import DeviceStorage from '../api/DeviceStorage';
import StringUtil from '../api/StringUtil';
import ModalDropdown from 'react-native-modal-dropdown';


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
            boxno_focused: true,

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
                lable: '装箱部件扫描记录'
            }, {
                name: 'ScanData_PhotoTake',
                lable: '装箱拍照记录'
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

    reset_DB() {
        this.setState({ reset_DB_Loading: true });

        //判断是否数据都同步完成，只有完成才可以重置数据库
        let scount = 0;
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    scount = scount + results.rows.item(0).ret;
                }
            });

        }, (error) => {
            console.log(error);
            sqLite.dropTable_ScanPartInBox();
            sqLite.createTable_ScanPartInBox();
            return;
        });

        if (scount >= 1) {
            Alert.alert('错误！', '还未同步的数据，请先上传数据，谢谢!', [{ text: 'OK', onPress: () => { } }]);
        } else {
            sqLite.dropTable_ScanPartInBox();
            sqLite.createTable_ScanPartInBox();
            ToastAndroid.show(
                '数据库重建完成！',
                ToastAndroid.LONG
            );
        }

        this.setState({ reset_DB_Loading: false });
    }


    select1_renderButtonText(rowData) {
        const { lable, name } = rowData;
        return `${lable} - ${name}`;
    }

    select1_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={styles.selectrow}>
                    <Text>
                        {`${rowData.lable} (${rowData.name})`}
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
        this.setState({ searchloading: true });
        db.transaction((tx) => {
            tx.executeSql("select * from ScanData_PartInBox where boxno='" + databoxno + "' order by id desc ", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let plist = [];
                    for (let i = 0; i < len; i++) {
                        let u = results.rows.item(i);
                        plist.push({
                            partno: u.partno,
                            synced: u.synced,
                            sync_ret: u.sync_ret,
                            sync_retmsg: u.sync_retmsg,
                            id: u.id
                        });
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

    render() {

        return (
            <WingBlank>
                <WhiteSpace />



                <Input ref="textInput1"
                    label="整箱唛头码："
                    type="text" value={this.state.boxno}
                    onChangeText={this.checkboxno}
                    onSubmitEditing={this.submitForm.bind(this)}
                    autoFocus={this.state.boxno_focused}
                    style={styles.inputS}
                    width={SCREEN_WIDTH - 20}
                    keyboardType="email-address"
                />


                <ScrollView style={styles.partlist}>
                    {
                        this.state.datalist.map((l) => (
                            <ListItem
                                roundAvatar={false}
                                key={l.id}
                                title={l.partno + ' 状态：' + l.synced}
                                subtitle={'返回值：' + l.sync_ret + ',信息：' + l.sync_retmsg}
                                hideChevron={true}
                                containerStyle={{ padding: 0, margin: 0, marginLeft: -20 }}
                            />
                        ))
                    }
                    {
                        this.state.datalist.length <= 0 ? <Text>查无记录！</Text> : ""
                    }
                </ScrollView>

                <View style={styles.btngroup}>

                    <Button backgroundColor='#6495ed' activeOpacity={1}
                        onPress={this.submitForm.bind(this)}
                        loading={this.state.searchloading}
                        title={'查询装箱同步数据'} />

                    <Button backgroundColor='#6495ed' activeOpacity={1}
                        onPress={this.reset_DB.bind(this)}
                        loading={this.state.reset_DB_Loading}
                        title={'重建数据表'} />
                </View>
            </WingBlank>
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
        backgroundColor: '#fff'
    },

    partlist: {
        padding: 10,
        paddingTop: 0,
        paddingBottom: 0,
        //justifyContent: 'flex-start',
        height: SCREEN_HEIGHT - 270,

    }, btngroup: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        top: SCREEN_HEIGHT - 150,
        marginLeft: "auto",
        marginRight: "auto",
        width: SCREEN_WIDTH - 30,

        paddingTop: 10,
        paddingBottom: 20,
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
    selectrow: {
        padding: 5,
    },
    SelecterDropDown: {
        width: SCREEN_WIDTH - 110,
        height: 120,
    }

});