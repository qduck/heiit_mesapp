"use strict";
import React from 'react';
import { HTTPPOST, HTTPPOST_Multipart } from '../api/HttpRequest';
import { StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { LogInfo, LogException, LogError } from '../api/Logger';


import SQLite from '../api/SQLite';
import StringUtil from '../api/StringUtil';

var RNFS = require('react-native-fs');
var sqLite = new SQLite();
var db;

class TimerScanDataSync_WoScan extends React.PureComponent {
    static scanpartsyncing = 0; // 部件扫描数据同步中，1同步中，0--未同步
    static boxphotosyncing = 0; // 装箱照片同步中，1同步中，0--未同步

    constructor(props) {
        super(props);


        this.state = {
            syncCount: 0,
            getCountLoading: false,
            syncPhotoCount: 0,
        };
    }

    async componentDidMount() {
        this.timer = null;
        this.timer2 = null;
        //开启数据库
        if (!db) {
            db = sqLite.open();
        }
        await sqLite.createTable_ForWoComplete();

        if (this.props.token != null && this.props.token != '' && this.timer == null) {
            this.startSync(this.props.token);
        }
        if (this.props.token != null && this.props.token != '' && this.timer2 == null) {
            this.startSync2(this.props.token);
        }
    }

    startSync(token) {
        //当同步开始执行时，设置
        if (TimerScanDataSync_WoScan.scanpartsyncing == 0) {
            TimerScanDataSync_WoScan.scanpartsyncing = 1;
        } else {
            return;
        }

        if (!db) {
            db = sqLite.open();
        }
        //查询
        db.transaction((tx) => {
            tx.executeSql("select id,usercode,wono,partno,smcount from ScanData_PartInWo where synced=0 LIMIT 1", [],
                (tx, results) => {
                    var len = results.rows.length;
                    if (len >= 1) {
                        let u = results.rows.item(0);
                        this.dosync(u, token);
                    } else {
                        //暂时没有数据，
                        this.deletePartScanHistoryData();
                        this.restartSync(10000);
                    }

                });
        }, (error) => {
            LogException('查询待同步工单部件扫描数据异常：' + error.message);
        });
    }
    //重新开始同步部件扫描
    restartSync(outtime) {
        TimerScanDataSync_WoScan.scanpartsyncing = 0; //处理完成
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(
            () => { this.startSync(this.props.token); },
            outtime
        );
    }

    dosync(record, token) {
        let data = {
            code: record.usercode,
            aufnr: record.wono,
            partBarCode: record.partno,
            smCount: record.smcount,
        };
        //同步关键部件数据
        HTTPPOST('/sm/addSMLog', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    db.transaction((tx) => {
                        tx.executeSql("update ScanData_PartInWo set synced=1 where id=" + record.id, [],
                            () => {
                                this.restartSync(100);

                                this.reflashNuSyncData();
                                //console.log('提交数据到服务器，并更新数据成功！！');
                            });
                    }, (error) => {
                        LogException('更新工单部件扫描记录异常：' + error.message);
                    });
                } else {
                    LogError('提交部件扫描数据，返回错误：', '错误信息：工单：' + data.aufnr + '，部件：' + data.partBarCode + ',return：' + res.code + '：' + res.msg);

                    let retcode = '0';
                    if (res.code) {
                        retcode = res.code;
                    }
                    if (retcode == '-28') {
                        //返回-28，扫描枪认证信息失效。
                        let { navigate } = this.props.navigation;
                        navigate('Login');
                        Alert.alert('登录认证已过期', '您的登录认证信息过期，可能长期未重新登录原因导致，请重新登录！');
                        return;
                    }

                    if (res.msg) {
                        Alert.alert(
                            '同步工单部件扫描数据失败！',
                            '工单：' + data.aufnr + '，部件：' + data.partBarCode + ',' + retcode + '：' + res.msg,
                            [
                                { text: '暂时跳过', onPress: () => this.jumpPartScanRecord(record.id, retcode, res.msg) }
                            ]);
                    } else {
                        this.jumpPartScanRecord(record.id, retcode, res.msg);
                    }
                    //console.log(res.msg);
                }
            }).catch((error) => {
                this.restartSync(3000);

                LogException('同步工单部件扫描数据到服务器异常', '工单：' + data.aufnr + '，部件：' + data.partBarCode + error.message);
            });
    }

    //跳过部件扫描记录
    jumpPartScanRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("update ScanData_PartInWo set synced=-1,sync_ret=" + ret + ",sync_retmsg='" + msg + "' where id=" + dataid, [],
                () => {
                    this.restartSync(1000);

                    this.reflashNuSyncData();
                });
        }, (error2) => {
            LogException('更新工单部件扫描数据异常：', '详情：' + error2.message);
        });
    }

    //删除SQL LITE中的历史数据
    deletePartScanHistoryData() {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PartInWo where synced=1 and addtime<datetime('now','-1 day')", [],
                () => {
                    LogInfo('删除已上传工单部件扫描数据成功！');
                });
        }, (error2) => {
            LogException('删除已上传工单部件扫描数据异常：', '详情：' + error2.message);
        });
    }

    //同步照片=======================================================》》》》》》》》》》》》》》》》》》》
    startSync2(token) {
        //当同步开始执行时，设置
        if (TimerScanDataSync_WoScan.boxphotosyncing == 0) {
            TimerScanDataSync_WoScan.boxphotosyncing = 1;
        } else {
            return;
        }

        if (!db) {
            db = sqLite.open();
        }
        //查询
        db.transaction((tx) => {
            tx.executeSql("select id,usercode,wono,photouri from ScanData_PhotoInWo where synced=0 LIMIT 1", [],
                (tx, results) => {
                    var len = results.rows.length;
                    if (len >= 1) {
                        let u = results.rows.item(0);

                        this.dosync2(u, token);

                    } else {

                        LogInfo('暂无可同步工单照片数据！', '20秒后继续检查。');
                        //清除历史照片文件
                        for (let indexday = -2; indexday >= -30; indexday = indexday - 1) {
                            this.deletePhotoFolder(indexday);
                        }
                        this.deletePhotoHistoryData();
                        //暂时没有数据，
                        this.restartSync2(20000);

                    }

                });
        }, (error) => {
            LogException('查询待同步工单照片数据异常：' + error.message);
        });
    }
    //待多少秒后，开始同步
    restartSync2(outtime) {
        TimerScanDataSync_WoScan.boxphotosyncing = 0; //处理完成
        this.timer2 && clearTimeout(this.timer2);
        this.timer2 = setTimeout(
            () => { this.startSync2(this.props.token); },
            outtime
        );
    }
    //同步照片数据
    async dosync2(record, token) {

        let formdata = new FormData();
        formdata.append('usercode', record.usercode);
        formdata.append('AUFNR', record.wono);
        let photofile = { uri: record.photouri, type: 'application/octet-stream', name: 'cameraphoto.jpg' };
        formdata.append('file', photofile);
        //同步关键部件数据
        let filepath = record.photouri.replace('file:///storage/emulated/0', RNFS.ExternalStorageDirectoryPath);
        await RNFS.exists(filepath).then(
            (ret) => {
                if (!ret) {
                    //Alert.alert('错误', '照片不存在！请重拍[' + record.wono + ']');
                    LogException('照片不存在！', '请重拍：' + record.wono);
                    this.deletePhotoRecord(record.id);
                    return;
                } else {
                    //LogInfo('开始同步照片数据：', JSON.stringify(record));
                    HTTPPOST_Multipart('/sm/uploadSMPhotoParam', formdata, token)
                        .then((res) => {
                            if (res.code >= 1) {
                                db.transaction((tx) => {
                                    tx.executeSql("update ScanData_PhotoInWo set synced=1 where id=" + record.id, [],
                                        () => {
                                            //删除照片
                                            this.deletePhotoFile(filepath);
                                            this.reflashPhotoNuSyncData();
                                            //LogInfo('同步工单照片成功：', '工单照片同步事件。');
                                            this.restartSync2(1000);

                                        });
                                }, (error) => {
                                    LogException('更新工单照片数据异常：', '异常：' + error.message);
                                });
                            } else {
                                let sync_ret = -1;
                                if (res.code) {
                                    sync_ret = res.code;
                                }
                                if (sync_ret == '-28') {
                                    //返回-28，扫描枪认证信息失效。
                                    let { navigate } = this.props.navigation;
                                    Alert.alert('错误！', '用户认证登录超时！' + res.msg, [{ text: '重新登录', onPress: () => navigate('Login') }]);
                                    return;
                                }
                                LogError('同步照片数据失败：', '错误' + sync_ret + '，信息：' + res.msg);
                                Alert.alert('同步照片数据失败！' + sync_ret, '信息：' + res.msg + ' ' + JSON.stringify(record), [{ text: '暂时跳过', onPress: () => this.jumpPhotoRecord(record.id, sync_ret, res.msg) }]);
                            }
                        }).catch((error) => {
                            let errmsg = error ? error.message : '未知原因';
                            LogException('同步工单完工-照片数据到服务器异常', ' 数据:' + JSON.stringify(record) + ' \r\n异常信息:' + error.message);

                            this.retryPhotoRecord(record.id, '-1', errmsg);
                        });
                    //照片上传完成
                }
            }
        )

    }

    //删除SQL LITE中的历史数据
    deletePhotoHistoryData() {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PhotoInWo where synced=1", [],
                () => {
                    LogInfo('删除已上传工单照片的数据成功！');
                });
        }, (error2) => {
            LogException('删除已上传工单照片的数据异常：', '详情：' + error2.message);
        });
    }
    //删除照片上传记录
    deletePhotoRecord(dataid) {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PhotoInWo where id=" + dataid, [],
                () => {
                    this.restartSync2(1000);

                    this.reflashPhotoNuSyncData();
                });
        }, (error2) => {
            LogException('删除照片数据异常：', '详情：' + error2.message);
        });
    }

    jumpPhotoRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("update ScanData_PhotoInWo set synced=-1,sync_ret='" + ret + "',sync_retmsg='" + StringUtil.replaceDYH(msg) + "' where id=" + dataid, [],
                () => {
                    this.restartSync2(3000);

                    this.reflashPhotoNuSyncData();
                });
        }, (error2) => {
            LogException('更新照片数据异常：', '详情：' + error2.message);
        });
    }

    //重置照片记录，只尝试3次上传，如果3次不成功，跳过此记录
    retryPhotoRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("select sync_retmsg as ret from ScanData_PhotoInWo where id=" + dataid, [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    if (results.rows.item(0).ret == "retry3") {
                        this.jumpPhotoRecord(dataid, "-1", "重试3次无效，跳过," + msg);
                    } else {
                        let sync_retmsg = "";
                        if (results.rows.item(0).ret == "retry1") {
                            sync_retmsg = "retry2"
                        } else if (results.rows.item(0).ret == "retry2") {
                            sync_retmsg = "retry3"
                        } else {
                            sync_retmsg = "retry1"
                        }
                        tx.executeSql("update ScanData_PhotoInWo set sync_retmsg='" + sync_retmsg + "' where id=" + dataid, [],
                            () => {
                                this.restartSync2(3000);

                            });
                    }
                }
                //console.info('查询未同步数据,' + zhuangtai + ':' + scount);
            });
        }, (error2) => {
            LogException('更新照片数据异常：', '详情：' + error2.message);
        });
    }

    deletePhotoFile(filepath) {
        RNFS.unlink(filepath)
            .then(() => {
                LogInfo('删除照片成功：', 'FILE DELETED:' + filepath);
            })
            .catch((err) => {
                LogException('删除照片异常：' + err.message);
            });
    }
    //删除历史照片文件夹,
    deletePhotoFolder(pcday) {
        let picdelete = '/storage/emulated/0/Pictures/boxing/' + StringUtil.getDateString(pcday);

        RNFS.exists(picdelete).then((res) => {
            if (res) {
                RNFS.unlink(picdelete)
                    .then(() => {
                        LogInfo('删除历史工单照片成功：', 'FILE DELETED ' + StringUtil.getDateString(pcday));
                    })
                    .catch((err) => {
                        LogException('删除历史工单照片异常：' + err.message);
                    });
            }
        }).catch((err) => {
            LogException('判断历史照片文件夹是否存在异常：' + err.message);
        });
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.timer2 && clearTimeout(this.timer2);
    }

    //刷新未同步的扫描数据记录
    reflashNuSyncData() {
        //查询
        this.setState({ getCountLoading: true });
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInWo where synced=0", [], (tx, results) => {
                let len = results.rows.length;
                if (len >= 1) {
                    let docount = results.rows.item(0).ret;
                    this.setState({ syncCount: docount });
                }

                this.setState({ getCountLoading: false });
            });
        }, (error) => {
            console.log(error);
            this.setState({ getCountLoading: false });
        });

    }

    reflashPhotoNuSyncData() {
        //查询
        this.setState({ getCountLoading: true });
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoInWo where synced=0", [], (tx, results) => {
                let len = results.rows.length;
                if (len >= 1) {
                    let docount = results.rows.item(0).ret;
                    this.setState({ syncPhotoCount: docount });
                }

                this.setState({ getCountLoading: false });
            });
        }, (error) => {
            console.log(error);
            this.setState({ getCountLoading: false });
        });

    }

    //重置执行器
    resetSync() {
        TimerScanDataSync_WoScan.scanpartsyncing = 0;
        TimerScanDataSync_WoScan.boxphotosyncing = 0;
        this.timer && clearTimeout(this.timer);
        this.timer2 && clearTimeout(this.timer2);
        this.timer = null;
        this.timer2 = null;

        if (this.props.token != null && this.props.token != '' && this.timer == null) {
            this.startSync(this.props.token);
            LogInfo('重置定时执行器成功！=>1');
        }

        if (this.props.token != null && this.props.token != '' && this.timer2 == null) {
            this.startSync2(this.props.token);
            LogInfo('重置定时执行器成功！=>2');
        }
    }

    render() {
        return (
            <Button buttonStyle={styles.syncbtn}
                backgroundColor='#00BB3F' activeOpacity={1}
                onPress={this.resetSync.bind(this)}
                title={'同步(' + this.state.syncCount + ',' + this.state.syncPhotoCount + ')'}
                loading={this.state.getCountLoading}
            />
        );
    }
}

const styles = StyleSheet.create({
    syncbtn: {
        height: 25,
        width: 120,
        alignSelf: 'flex-end'
    }
});

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token
    })
)(TimerScanDataSync_WoScan)


