import React from 'react';


class StringUtil {
    /**
     * 获取
     * @param key
     * @returns  
     */

    //是否为数字
    static isRealNum(val) {
        //数字包含小数点 --- /^\d+(\.\d+)?$/
        //纯数字---/^\d+$/
        const result = /^\d+(\.\d+)?$/.test(val);
        return result;
    }

    //剪切字符串
    static cutStringTail(thestr, cutcount) {
        let strlen = thestr.length;
        return thestr.substring(0, strlen - cutcount);
    }

    //获取当前日期字符数据
    static getNowDate() {
        var date = new Date();

        var year = date.getFullYear().toString();

        var month = (date.getMonth() + 1).toString();
        if (month.length == 1) {
            month = '0' + month;
        }
        var day = date.getDate().toString();
        if (day.length == 1) {
            day = '0' + day;
        }
        //var hour = date.getHours().toString();
        //var minute = date.getMinutes().toString();

        return year + '' + month + '' + day + '';
    }

    //获取时间字符传格式，参数是当前，前几天或后几天
    static getDateString(daycount) {
        var date = new Date();
        if (daycount > 0) {
            date = this.getAfterDayDate(daycount);
        } else if (daycount < 0) {
            date = this.getBeforeDayDate(-daycount);
        }

        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        if (month.length == 1) {
            month = '0' + month;
        }
        var day = date.getDate().toString();
        if (day.length == 1) {
            day = '0' + day;
        }
        //var hour = date.getHours().toString();
        //var minute = date.getMinutes().toString();
        return year + '' + month + '' + day + '';
    }

    //获取几天之前或几天之后的日期
    static getBeforeDayDate(day) {
        var date = new Date(), timestamp;
        timestamp = date.getTime();
        // 获取day天前的日期  
        return new Date(timestamp - day * 24 * 3600 * 1000);
    }

    //获取几天之前或几天之后的日期
    static getAfterDayDate(day) {
        var date = new Date(), timestamp;
        timestamp = date.getTime();
        // 获取day天之后的日期  
        return new Date(timestamp + day * 24 * 3600 * 1000);
    }

    //删除字符中的单引号
    static replaceDYH(str) {
        return str.replace(/\'/g, "’");
    }

    //删除字符中的双引号
    static replaceSYH(str) {
        return str.replace(/\"/g, "”");
    }

    //删除字符中的尖括号
    static replaceJKH(str) {
        return str.replace(/</g, "《").replace(/>/g, "》");
    }


}

export default StringUtil;
