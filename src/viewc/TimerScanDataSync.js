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

class TimerScanDataSync extends React.Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.timer2 = null;
        this.state = {
            syncCount: 0,
            getCountLoading: false,
            syncPhotoCount: 0,
        };
    }
    componentWillMount() {
        if (!db) {
            sqLite.open();
        }
        sqLite.createTable_ScanPartInBox();
    }
    componentDidMount() {
        //开启数据库
        if (!db) {
            db = sqLite.open();
        }

        if (this.props.token != null && this.props.token != '' && this.timer == null) {
            this.startSync(this.props.token);
        }

        if (this.props.token != null && this.props.token != '' && this.timer2 == null) {
            this.startSync2(this.props.token);
        }
    }

    startSync(token) {
        if (!db) {
            db = sqLite.open();
        }
        //查询
        db.transaction((tx) => {
            tx.executeSql("select id,usercode,boxno,partno from ScanData_PartInBox where synced=0 LIMIT 1", [],
                (tx, results) => {
                    var len = results.rows.length;
                    if (len >= 1) {
                        let u = results.rows.item(0);
                        this.dosync(u, token);
                    } else {
                        //暂时没有数据，
                        this.deletePartScanHistoryData();
                        //开始清空历史数据
                        this.timer = setTimeout(
                            () => { this.startSync(this.props.token); },
                            10000
                        );
                    }

                });
        }, (error) => {
            LogException('查询待同步装箱部件扫描数据异常：' + error.message);
        });
    }

    dosync(record, token) {
        let data = {
            code: record.usercode,
            packBarCode: record.boxno,
            partBarCode: record.partno
        };
        //同步关键部件数据
        HTTPPOST('/sm/ExecGJJSM', data, token)
            .then((res) => {
                if (res.code >= 1) {
                    db.transaction((tx) => {
                        tx.executeSql("update ScanData_PartInBox set synced=1 where id=" + record.id, [],
                            () => {
                                this.timer = setTimeout(
                                    () => { this.startSync(this.props.token); },
                                    1000
                                );
                                this.reflashNuSyncData();
                                //console.log('executeSql success！');
                            });
                    }, (error) => {
                        LogException('更新装箱部件扫描数据异常：', '异常：' + error.message);
                    });
                } else {
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

                    Alert.alert(
                        '同步装箱部件扫描数据失败！',
                        '箱子：' + data.packBarCode + '，部件：' + data.partBarCode + ',' + retcode + '：' + res.msg,
                        [
                            { text: '暂时跳过', onPress: () => this.jumpPartScanRecord(record.id, retcode, res.msg) }
                        ]);
                }
            }).catch((error) => {
                this.timer = setTimeout(() => { this.startSync(this.props.token); }, 3000);

                // Alert.alert(
                //     '同步失败！',
                //     '箱子：' + data.packBarCode + '，部件：' + data.partBarCode + ',' + error,
                //     [
                //         {
                //             text: '修复并继续',
                //             onPress: () => this.timer = setTimeout(() => { this.startSync(this.props.token); }, 3000)
                //         }
                //     ]);
                LogException('同步装箱部件扫描数据到服务器异常', '箱子：' + data.packBarCode + '，部件：' + data.partBarCode + '，错误信息：' + error.message);
            });
    }

    //跳过部件扫描记录
    jumpPartScanRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("update ScanData_PartInBox set synced=-1,sync_ret=" + ret + ",sync_retmsg='" + msg + "' where id=" + dataid, [],
                () => {
                    this.timer = setTimeout(
                        () => { this.startSync(this.props.token); },
                        1000
                    );
                    this.reflashNuSyncData();
                });
        }, (error2) => {
            LogException('更新部件扫描数据异常：', '详情：' + error2.message);
        });
    }

    //删除SQL LITE中的历史数据
    deletePartScanHistoryData() {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PartInBox where synced=1", [],
                () => {
                    LogInfo('删除已上传装箱部件扫描数据成功！');
                });
        }, (error2) => {
            LogException('删除已上传装箱部件扫描数据异常：', '详情：' + error2.message);
        });
    }

    ///===================================================================》》》》》》》》》》》》》》》》
    //同步照片
    startSync2(token) {
        if (!db) {
            db = sqLite.open();
        }
        //查询
        db.transaction((tx) => {
            tx.executeSql("select id,usercode,boxno,photouri from ScanData_PhotoTake where synced=0 LIMIT 1", [],
                (tx, results) => {
                    var len = results.rows.length;
                    if (len >= 1) {
                        let u = results.rows.item(0);
                        this.dosync2(u, token);
                    } else {
                        //清除历史照片文件
                        LogInfo('暂无可同步工单照片数据！', '20秒后继续检查。');
                        //清除历史照片文件
                        for (let indexday = -30; indexday >= -60; indexday = indexday - 1) {
                            this.deletePhotoFolder(indexday);
                        }
                        this.deletePhotoHistoryData();

                        //暂时没有数据，
                        this.timer2 = setTimeout(
                            () => { this.startSync2(this.props.token); },
                            20000
                        );
                        // 删除相册中的文件，有风险，可能将用户自己手机上的照片删除
                        // let cameraphoto = '/storage/emulated/0/DCIM/Camera/';
                        // RNFS.exists(cameraphoto).then((res) => {
                        //     if (res) {
                        //         RNFS.unlink(cameraphoto)
                        //             .then(() => {
                        //                 LogInfo('删除手机相册图片成功：', 'FILE DELETED:' + cameraphoto);
                        //             })
                        //             .catch((err) => {
                        //                 LogException('删除手机相册图片异常：' + err.message);
                        //             });
                        //     }
                        // }
                        // ).catch((err) => {
                        //     LogException('判断手机相册文件夹是否存在异常：' + err.message);
                        // });
                    }
                });
        }, (error) => {
            LogException('查询待同步装箱照片数据异常：' + error.message);
        });
    }
    //同步照片数据
    async dosync2(record, token) {

        let formdata = new FormData();
        formdata.append('usercode', record.usercode);
        formdata.append('boxbarcode', record.boxno);
        let photofile = { uri: record.photouri, type: 'application/octet-stream', name: 'cameraphoto.jpg' };
        formdata.append('file', photofile);
        //检查照片文件是否存在
        let filepath = record.photouri.replace('file:///storage/emulated/0', RNFS.ExternalStorageDirectoryPath);
        RNFS.exists(filepath).then(
            (ret) => {
                if (!ret) {
                    LogException('照片不存在！', '请重拍：' + record.boxno);
                    this.deletePhotoRecord(record.id);
                    return;
                } else {
                    //照片存在的情况下执行。
                    //同步关键部件数据
                    HTTPPOST_Multipart('/sm/uploadPhotoParam', formdata, token)
                        .then((res) => {
                            if (res.code >= 1) {
                                db.transaction((tx) => {
                                    tx.executeSql("update ScanData_PhotoTake set synced=1 where id=" + record.id, [],
                                        () => {
                                            //删除照片
                                            this.deletePhotoFile(filepath);
                                            this.reflashPhotoNuSyncData();
                                            this.timer2 = setTimeout(
                                                () => { this.startSync2(this.props.token); },
                                                1000
                                            );
                                        });
                                }, (error) => {
                                    LogException('更新装箱照片数据异常：', '异常：' + error.message);
                                });
                            } else {
                                let sync_ret = -1;
                                if (res.code) {
                                    sync_ret = res.code;
                                }
                                if (sync_ret == '-28') {
                                    //返回-28，扫描枪认证信息失效。
                                    let { navigate } = this.props.navigation;
                                    Alert.alert('错误！', '用户认证登录超时！' + res.msg, [{ text: 'OK', onPress: () => navigate('Login') }]);
                                    return;
                                }
                                LogError('同步照片数据失败：', '错误' + sync_ret + '，信息：' + res.msg);
                                Alert.alert('同步照片数据失败！' + sync_ret, '信息：' + res.msg + ' ' + JSON.stringify(record), [
                                    { text: '暂时跳过', onPress: () => this.jumpPhotoRecord(record.id, sync_ret, res.msg) },
                                    { text: '错误删除', onPress: () => this.deletePhotoRecord(record.id) }
                                ]);
                            }
                        }).catch((error) => {
                            let errmsg = error ? error.message : '未知原因';
                            LogException('同步装箱完工-照片数据到服务器异常', ' 数据:' + JSON.stringify(record) + ' \r\n异常信息:' + errmsg);
                            //this.timer2 = setTimeout(() => { this.startSync2(this.props.token); }, 3000);
                            this.retryPhotoRecord(record.id, '-1', errmsg);
                            // Alert.alert('数据同步异常，请检查！', '错误信息：' + errmsg + '，数据：' + JSON.stringify(record), [
                            //     {
                            //         text: '修复并继续',
                            //         onPress: () => this.timer2 = setTimeout(() => { this.startSync2(this.props.token); }, 3000)
                            //     },
                            //     {
                            //         text: '无法修复跳过',
                            //         onPress: () => this.jumpPhotoRecord(record.id, '-1', errmsg)
                            //     }
                            // ]);
                        });
                    //上传照片数据完成
                }
            }
        )

    }

    //删除SQL LITE中的历史数据
    deletePhotoHistoryData() {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PhotoTake where synced=1", [],
                () => {
                    LogInfo('删除已上传装箱照片的数据成功！');
                });
        }, (error2) => {
            LogException('删除已上传装箱照片的数据异常：', '详情：' + error2.message);
        });
    }

    //删除照片上传记录
    deletePhotoRecord(dataid) {
        db.transaction((tx) => {
            tx.executeSql("delete from ScanData_PhotoTake where id=" + dataid, [],
                () => {
                    this.timer2 = setTimeout(
                        () => { this.startSync2(this.props.token); },
                        1000
                    );
                    this.reflashPhotoNuSyncData();
                });
        }, (error2) => {
            LogException('删除照片数据异常：', '详情：' + error2.message);
        });
    }



    jumpPhotoRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("update ScanData_PhotoTake set synced=-1,sync_ret='" + ret + "',sync_retmsg='" + StringUtil.replaceDYH(msg) + "' where id=" + dataid, [],
                () => {
                    this.timer2 = setTimeout(
                        () => { this.startSync2(this.props.token); },
                        3000
                    );
                    this.reflashPhotoNuSyncData();
                });
        }, (error2) => {
            LogException('更新照片数据异常：', '详情：' + error2.message);
        });
    }

    //重置照片记录，只尝试3次上传，如果3次不成功，跳过此记录
    retryPhotoRecord(dataid, ret, msg) {
        db.transaction((tx) => {
            tx.executeSql("select sync_retmsg as ret from ScanData_PhotoTake where id=" + dataid, [], (tx, results) => {
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
                        tx.executeSql("update ScanData_PhotoTake set sync_retmsg='" + sync_retmsg + "' where id=" + dataid, [],
                            () => {
                                this.timer2 = setTimeout(
                                    () => { this.startSync2(this.props.token); },
                                    3000
                                );
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
                        LogInfo('删除历史装箱照片成功：', 'FILE DELETED ' + StringUtil.getDateString(pcday));
                    })
                    .catch((err) => {
                        LogException('删除历史装箱照片异常：' + err.message);
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


    //重置执行器
    resetSync() {
        this.timer && clearTimeout(this.timer);
        this.timer2 && clearTimeout(this.timer2);

        if (this.props.token != null && this.props.token != '' && this.timer == null) {
            this.startSync(this.props.token);
            LogInfo('重置定时执行器成功！=>1');
        }

        if (this.props.token != null && this.props.token != '' && this.timer2 == null) {
            this.startSync2(this.props.token);
            LogInfo('重置定时执行器成功！=>2');
        }
    }

    //刷新未同步的扫描数据记录
    reflashNuSyncData() {
        //查询
        if (this.state.getCountLoading == false) {
            this.setState({ getCountLoading: true });
        }
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let docount = results.rows.item(0).ret;
                    this.setState({ syncCount: docount });
                }
                if (this.state.getCountLoading == true) {
                    this.setState({ getCountLoading: false });
                }
            });
        }, (error) => {
            //console.log(error);
            LogException('查询待同步部件扫描数据异常：' + error.message);
            if (this.state.getCountLoading == true) {
                this.setState({ getCountLoading: false });
            }
        });
        //this.reflashPhotoNuSyncData();
    }

    reflashPhotoNuSyncData() {
        //查询
        if (this.state.getCountLoading == false) {
            this.setState({ getCountLoading: true });
        }
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let docount = results.rows.item(0).ret;
                    this.setState({ syncPhotoCount: docount });
                }

                if (this.state.getCountLoading == true) {
                    this.setState({ getCountLoading: false });
                }
            });
        }, (error) => {
            //console.log(error);
            LogException('查询待同步装箱照片数据异常：' + error.message);
            if (this.state.getCountLoading == true) {
                this.setState({ getCountLoading: false });
            }
        });
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
)(TimerScanDataSync)


