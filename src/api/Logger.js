"use strict";
import React from 'react';

import Config from 'react-native-config';

import StringUtil from '../api/StringUtil';

var RNFS = require('react-native-fs');

var appdir = RNFS.ExternalStorageDirectoryPath + '/' + Config.Log_Dir;

var path = appdir + '/' + Config.Log_FileInfo;

var path2 = appdir + '/' + Config.Log_FileExceprion;

var path3 = appdir + '/' + Config.Log_FileError;

RNFS.mkdir(appdir);

function createlogfile(logfilepath) {
    RNFS.exists(logfilepath)
        .then((retvalue) => {
            if (retvalue == false) {
                RNFS.writeFile(logfilepath, 'file created', 'utf8')
                    .then((success) => {
                        console.log('FILE WRITTEN!');
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
            } else {
                RNFS.stat(logfilepath).then(
                    (retobj) => {
                        console.log(retobj.size);
                        if ((retobj.size / 1024 / 1024) >= 1) {
                            RNFS.moveFile(logfilepath, logfilepath.replace('.txt', '_' + StringUtil.getNowDate() + '.txt'))
                                .then(function () {
                                    RNFS.writeFile(logfilepath, 'file new created', 'utf8')
                                        .then(function () {
                                            console.log('FILE RENEW WRITTEN!');
                                        })
                                });

                        }
                    }
                );
            }
        }).catch((err) => {
            console.log(err.message);
        });
}

function getmyDate() {
    var date = new Date();

    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minute = date.getMinutes().toString();
    var second = date.getSeconds().toString();
    return year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second;
}


function LogInfo(title, message) {

    let content = '[' + getmyDate() + '] ' + title + '==>' + message + '。\r\n';
    RNFS.appendFile(path, content, 'utf8')
        .then((success) => {
            console.log('Log FILE WRITTEN!');
        })
        .catch((err) => {
            console.log(err.message);
        });
}

function LogException(title, message) {

    let content = '[' + getmyDate() + '] ' + title + '==>' + message + '。\r\n';
    RNFS.appendFile(path2, content, 'utf8')
        .then((success) => {
            console.log('Log FILE WRITTEN!');
        })
        .catch((err) => {
            console.log(err.message);
        });
}

function LogError(title, message) {

    let content = '[' + getmyDate() + '] ' + title + '==>' + message + '。\r\n';
    RNFS.appendFile(path3, content, 'utf8')
        .then((success) => {
            console.log('Log FILE WRITTEN!');
        })
        .catch((err) => {
            console.log(err.message);
        });
}


createlogfile(path);
createlogfile(path2);
createlogfile(path3);

export { LogInfo, LogException, LogError }