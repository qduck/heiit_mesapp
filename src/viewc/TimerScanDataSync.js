"use strict";
import React from 'react';
import { HTTPPOST, HTTPPOST_Multipart } from '../api/HttpRequest';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { LogInfo, LogException } from '../api/Logger';

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

    componentDidMount() {
        //开启数据库
        if (!db) {
            db = sqLite.open();
        }

        if (this.props.token != null && this.props.token != '') {
            this.startSync(this.props.token);

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
                        this.timer = setTimeout(
                            () => { this.startSync(this.props.token); },
                            10000
                        );
                    }

                });
        }, (error) => {
            console.log(error);
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
                                console.log('executeSql success！');

                            });
                    }, (error) => {
                        console.log(error);
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
                        return;
                    }

                    db.transaction((tx) => {
                        tx.executeSql("update ScanData_PartInBox set synced=-1,sync_ret=" + retcode + ",sync_retmsg='" + res.message + "' where id=" + record.id, [],
                            () => {
                                this.timer = setTimeout(
                                    () => { this.startSync(this.props.token); },
                                    1000
                                );
                                this.reflashNuSyncData();
                                console.log('executeSql error！');

                            });
                    }, (error) => {
                        console.log(error);
                    });
                    console.log(res.msg);
                }
            }).catch((error) => {
                console.log(error);
            });
    }

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
                        let picdelete = '/storage/emulated/0/Pictures/boxing/' + StringUtil.getDateString(-30);

                        RNFS.exists(picdelete).then((res) => {
                            if (res) {
                                RNFS.unlink(picdelete)
                                    .then(() => {
                                        LogInfo('删除历史照片成功：', 'FILE DELETED:' + cameraphoto);
                                    })
                                    .catch((err) => {
                                        LogException('删除历史照片异常：' + err.message);
                                    });
                            }
                        }).catch((err) => {
                            LogException('判断历史照片文件夹是否存在异常：' + err.message);
                        });


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


                        //暂时没有数据，
                        this.timer2 = setTimeout(
                            () => { this.startSync2(this.props.token); },
                            10000
                        );
                    }

                });
        }, (error) => {
            console.log(error);
        });
    }
    //同步照片数据
    dosync2(record, token) {

        let formdata = new FormData();
        formdata.append('usercode', record.usercode);
        formdata.append('boxbarcode', record.boxno);
        let photofile = { uri: record.photouri, type: 'application/octet-stream', name: 'cameraphoto.jpg' };
        formdata.append('file', photofile);
        //同步关键部件数据
        HTTPPOST_Multipart('/sm/uploadPhotoParam', formdata, token)
            .then((res) => {
                if (res.code >= 1) {
                    db.transaction((tx) => {
                        tx.executeSql("update ScanData_PhotoTake set synced=1 where id=" + record.id, [],
                            () => {

                                //删除照片
                                console.log(record.photouri);
                                let filepath = record.photouri.replace('file:///storage/emulated/0', RNFS.ExternalStorageDirectoryPath);

                                RNFS.unlink(filepath)
                                    .then(() => {
                                        LogInfo('删除照片成功：', 'FILE DELETED:' + filepath);
                                    })
                                    .catch((err) => {
                                        LogException('删除照片异常：' + err.message);
                                    });

                                //console.log('executeSql success！');
                                this.reflashPhotoNuSyncData();
                                this.timer2 = setTimeout(
                                    () => { this.startSync2(this.props.token); },
                                    1000
                                );


                            });
                    }, (error) => {
                        console.log(error);
                    });
                } else {
                    let sync_ret = -1;
                    if (res.code) {
                        sync_ret = res.code;
                    }
                    if (sync_ret == '-28') {
                        //返回-28，扫描枪认证信息失效。
                        let { navigate } = this.props.navigation;
                        navigate('Login');
                        return;
                    }
                    db.transaction((tx) => {
                        tx.executeSql("update ScanData_PhotoTake set synced=-1,sync_ret=" + sync_ret + ",sync_retmsg='" + res.message + "' where id=" + record.id, [],
                            () => {
                                this.timer2 = setTimeout(
                                    () => { this.startSync2(this.props.token); },
                                    1000
                                );
                                this.reflashPhotoNuSyncData();
                                console.log('executeSql error！');

                            });
                    }, (error) => {
                        console.log(error);
                    });
                    console.log(res.msg);
                }
            }).catch((error) => {
                db.transaction((tx) => {
                    tx.executeSql("update ScanData_PhotoTake set synced=-1,sync_ret='RN程序异常',sync_retmsg='" + error + "' where id=" + record.id, [],
                        () => {
                            this.timer2 = setTimeout(
                                () => { this.startSync2(this.props.token); },
                                1000
                            );
                            this.reflashPhotoNuSyncData();
                            LogException('同步照片异常！', ' 数据:' + JSON.stringify(record) + ' \r\n异常信息:' + error);
                        });
                }, (error2) => {
                    console.log(error2);
                });
            });
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        clearTimeout(this.timer2);
    }

    //刷新未同步的扫描数据记录
    reflashNuSyncData() {
        //查询
        this.setState({ getCountLoading: true });
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PartInBox where synced=0", [], (tx, results) => {
                var len = results.rows.length;
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
        this.reflashPhotoNuSyncData();
    }

    reflashPhotoNuSyncData() {
        //查询
        this.setState({ getCountLoading: true });
        db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where synced=0", [], (tx, results) => {
                var len = results.rows.length;
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


        if (this.props.token != null && this.props.token != '' && this.timer == null) {
            this.startSync(this.props.token);
        }

        if (this.props.token != null && this.props.token != '' && this.timer2 == null) {
            this.startSync2(this.props.token);
        }
    }

    render() {
        return (
            <Button buttonStyle={styles.syncbtn}
                backgroundColor='#00BB3F' activeOpacity={1}
                onPress={this.reflashNuSyncData.bind(this)}
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


