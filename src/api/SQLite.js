//SQLite.js
import React, { Component } from 'react';
import {
    ToastAndroid,
} from 'react-native';
import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(true);
var database_name = "XioLiftMES.db";//数据库文件
var database_version = "1.0";//版本号
var database_displayname = "MESSQLite";
var database_size = -1;
var db;

export default class SQLite extends Component {

    componentWillUnmount() {
        if (db) {
            this._successCB('close');
            db.close();
        } else {
            console.log("SQLiteStorage not open");
        }
    }
    open() {
        db = SQLiteStorage.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
            () => {
                this._successCB('open');
            },
            (err) => {
                this._errorCB('open', err);
            });
        return db;
    }
    createTable_ScanPartInBox() {
        if (!db) {
            this.open();
        }
        //创建用户表
        db.transaction((tx) => {

            let scandata_partin = 'CREATE TABLE IF NOT EXISTS ScanData_PartInBox(' +
                'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
                'boxno varchar,' +
                'partno VARCHAR,' +
                'usercode VARCHAR,' +
                'synced INTEGER,' +
                'sync_ret INTEGER,' +
                'sync_retmsg VARCHAR' +
                ');';
            tx.executeSql(
                scandata_partin, [], () => {
                    this._successCB('executeSql');
                }, (err) => {
                    this._errorCB('executeSql', err);
                });

            let scandata_phototake = 'CREATE TABLE IF NOT EXISTS ScanData_PhotoTake(' +
                'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
                'boxno varchar,' +
                'photouri VARCHAR,' +
                'usercode VARCHAR,' +
                'synced INTEGER,' +
                'sync_ret INTEGER,' +
                'sync_retmsg VARCHAR' +
                ');';
            tx.executeSql(
                scandata_phototake, [], () => {
                    this._successCB('executeSql');
                }, (err) => {
                    this._errorCB('executeSql', err);
                });
            // let scandata_boxclose = 'CREATE TABLE IF NOT EXISTS ScanData_BoxClose(' +
            //     'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
            //     'boxno varchar,' +
            //     'usercode VARCHAR,' +
            //     'synced INTEGER,' +
            //     'sync_ret INTEGER,' +
            //     'sync_retmsg VARCHAR' +
            //     ');';
            // tx.executeSql(
            //     scandata_boxclose, [], () => {
            //         this._successCB('executeSql');
            //     }, (err) => {
            //         this._errorCB('executeSql', err);
            //     });
            let todo_partlist = 'CREATE TABLE IF NOT EXISTS Todo_PartList(' +
                'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
                'boxno varchar,' +
                'boxno_nopartial varchar,' +
                'partno varchar,' +
                'partname varchar,' +
                'quantity float,' +
                'scannedQuantity float,' +
                'ztype VARCHAR' +
                ');';
            tx.executeSql(
                todo_partlist, [], () => {
                    this._successCB('executeSql');
                }, (err) => {
                    this._errorCB('executeSql', err);
                });
            let todo_packlist = 'CREATE TABLE IF NOT EXISTS Todo_PackList(' +
                'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
                'boxno varchar,' +
                'boxno_nopartial varchar,' +
                'boxphoto float,' +
                'boxphototaked float,' +
                'closed int' +
                ');';
            tx.executeSql(
                todo_packlist, [], () => {
                    this._successCB('executeSql');
                }, (err) => {
                    this._errorCB('executeSql', err);
                });

        }, (err) => {//所有的 transaction都应该有错误的回调方法，在方法里面打印异常信息，不然你可能不会知道哪里出错了。
            this._errorCB('transaction', err);
        }, () => {
            this._successCB('transaction');
        })
    }
    deleteTable_ScanPartInBox() {
        if (!db) {
            this.open();
        }
        db.transaction((tx) => {
            tx.executeSql('delete from ScanData_PartInBox;', [], () => {
            });
            tx.executeSql('delete from ScanData_PhotoTake;', [], () => {
            });
            tx.executeSql('delete from Todo_PartList;', [], () => {
            });
            tx.executeSql('delete from Todo_PackList;', [], () => {
            });
        });
    }
    dropTable_ScanPartInBox() {
        db.transaction((tx) => {
            let droptable = 'drop table ScanData_PartInBox;';
            tx.executeSql(droptable, [], () => {
            });
            let droptable1 = 'drop table ScanData_PhotoTake;';
            tx.executeSql(droptable1, [], () => {
            });
            // let droptable2 = 'drop table ScanData_BoxClose;';
            // tx.executeSql(droptable2, [], () => {
            // });
            let droptable3 = 'drop table Todo_PartList;';
            tx.executeSql(droptable3, [], () => {
            });
            let droptable4 = 'drop table Todo_PackList;';
            tx.executeSql(droptable4, [], () => {
            });
        }, (err) => {
            this._errorCB('transaction', err);
        }, () => {
            this._successCB('transaction');
        });
    }
    //插入待装箱箱子信息
    insertData_Todo_PackList(boxno, boxno_nopartial, boxphoto) {
        if (!db) {
            this.open();
        }

        //不存在此唛头新增记录
        db.transaction((tx) => {
            let checkBoxnoIsExists = true;
            tx.executeSql("select count(*) as ret from Todo_PackList where boxno='" + boxno + "'", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let scount = results.rows.item(0).ret;
                    if (scount >= 1) {
                        checkBoxnoIsExists = true;
                    } else {
                        checkBoxnoIsExists = false;
                    }
                } else {
                    checkBoxnoIsExists = false;
                }
            });
            if (!checkBoxnoIsExists) {
                let sql = "INSERT INTO Todo_PackList(boxno,boxno_nopartial,boxphoto,boxphototaked,closed) " +
                    "values(?,?,?,0,0)";
                tx.executeSql(sql, [boxno, boxno_nopartial, boxphoto], () => {

                }, (err) => {
                    console.log(err);
                }
                );
            }

        }, (error) => {
            this._errorCB('transaction', error);
        }, () => {
            this._successCB('transaction insert data');
        });

    }



    //插入待装箱部件信息
    insertData_Todo_PartList(partData) {
        let len = partData.length;
        if (len == 0) {
            return;
        }
        if (!db) {
            this.open();
        }
        let theboxno_nopartial = partData[0].boxno_nopartial;
        let theboxno = partData[0].boxno;

        db.transaction(async (tx) => {
            let IsSyncing = false;
            await tx.executeSql("select count(*) as ret from ScanData_PartInBox where boxno='" + theboxno + "' and synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    let scount = results.rows.item(0).ret;
                    if (scount >= 1) {
                        IsSyncing = true;
                    } else {
                        IsSyncing = false;
                    }
                }
            });
            if (!IsSyncing) {
                await tx.executeSql("delete from Todo_PartList where boxno_nopartial='" + theboxno_nopartial + "'", [], () => {
                });
                console.info(theboxno_nopartial + '开始加载数据到SQL Lite数据库');
                //插入数据
                for (let i = 0; i < len; i++) {
                    var partinfo = partData[i];
                    let boxno = partinfo.boxno;
                    let boxno_nopartial = partinfo.boxno_nopartial;
                    let partno = partinfo.partno;
                    let partname = partinfo.partname;
                    let number = partinfo.number;
                    let innumber = partinfo.innumber;
                    let ztype = partinfo.ztype;
                    let sql = "INSERT INTO Todo_PartList(boxno,boxno_nopartial,partno,partname,quantity,scannedQuantity,ztype)" +
                        "values(?,?,?,?,?,?,?)";
                    tx.executeSql(sql, [boxno, boxno_nopartial, partno, partname, number, innumber, ztype], () => {

                    }, (err) => {
                        console.log(err);
                    }
                    );
                }
                console.info(theboxno_nopartial + 'PartList数据插入完成！');
            }


        }, (error) => {
            this._errorCB('transaction', error);
        }, () => {
            this._successCB('transaction insert data');
        });

    }


    //判断是否还有照片未上传按boxno
    async checkPhotoIsCompleted(boxno) {
        if (!db) {
            this.open();
        }
        await db.transaction((tx) => {
            tx.executeSql("select count(*) as ret from ScanData_PhotoTake where boxno='" + boxno + "' and synced=0", [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {

                    let scount = results.rows.item(0).ret;
                    console.info("判断照片是否还有未同步的完成,照片数量:" + scount);
                    if (scount >= 1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            });

        }, (error) => {
            console.log(error);
            return true;
        });
    }

    //获取箱子的照片数量
    getPhotoNumByBox(boxno) {
        if (!db) {
            this.open();
        }

    }


    //插入关键部件扫描数据
    async insertData_ScanPartInBox(scanData) {
        let len = scanData.length;
        if (!db) {
            this.open();
        }
        await db.transaction((tx) => {
            for (let i = 0; i < len; i++) {
                var scan1 = scanData[i];
                let usercode = scan1.code;
                let boxno = scan1.boxno;
                let partno = scan1.partno;
                let ztype = scan1.ztype;
                let number = scan1.number;
                let id = scan1.id;
                let sql = "INSERT INTO ScanData_PartInBox(boxno,partno,usercode,synced)" +
                    "values(?,?,?,0);";
                let sql2 = "update Todo_PartList set scannedQuantity=scannedQuantity+" + number + " where id=" + id + ";";
                tx.executeSql(sql, [boxno, partno, usercode], () => {
                }, (err) => { console.log(err); });
                tx.executeSql(sql2, [], () => {
                }, (err) => { console.log(err); });
            }
            console.info("插入部件扫描记录，成功！");
        }, (error) => {
            this._errorCB('transaction', error);
        }, () => {
            this._successCB('transaction insert data');
        });
    }

    //插入照片记录
    insertData_ScanPhotoTake(photodata) {
        if (!db) {
            this.open();
        }
        db.transaction((tx) => {

            let usercode = photodata.usercode;
            let boxno = photodata.boxno;
            let photouri = photodata.photouri;
            let sql = "INSERT INTO ScanData_PhotoTake(boxno,photouri,usercode,synced)" +
                "values(?,?,?,0);";
            let sql2 = "update Todo_PackList set boxphototaked=boxphototaked+1 where boxno='" + boxno + "'";
            tx.executeSql(sql, [boxno, photouri, usercode], () => {

            }, (err) => {
                console.log(err);
            }
            );
            tx.executeSql(sql2, [], () => {

            }, (err) => {
                console.log(err);
            }
            );

        }, (error) => {
            this._errorCB('transaction', error);
        }, () => {
            this._successCB('transaction insert data');
        });
    }

    close() {
        if (db) {
            this._successCB('close');
            db.close();
        } else {
            console.log("SQLiteStorage not open");
        }
        db = null;
    }
    _successCB(name) {
        console.log("SQLiteStorage " + name + " success");
    }
    _errorCB(name, err) {
        console.log("SQLiteStorage " + name);
        console.log(err);
    }

    //新增函数
    selectCount(searchSql) {
        if (!db) {
            this.open();
        }
        //查询
        db.transaction((tx) => {
            tx.executeSql(searchSql, [], (tx, results) => {
                var len = results.rows.length;
                if (len >= 1) {
                    return results.rows.item(0).ret;
                } else {
                    return '';
                }
            });
        }, (error) => {
            console.log(error);
        });
    }

    render() {
        return null;
    }
}