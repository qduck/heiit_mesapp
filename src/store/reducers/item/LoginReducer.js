/**
 * create by qduck on 2018/08/07
 * reducers
 */
"use strict";
import * as TYPES from '../../ActionType';

/**
 * 这里可以初始化一个默认的实体类
 */
const initialState = {
    status: '',
    message: '',
    user: null,
    token: ''
}

// 不同类别的事件使用switch对应处理过程
export default function loginIn(state = initialState, action) {
    switch (action.type) {
        case TYPES.LOGIN_IN_DOING:
            return {
                ...state,
                status: '123',
                message: '登陆中...',
                user: null,
                token: ''
            }
            break;
        case TYPES.LOGIN_IN_DONE:
            return {
                ...state,
                status: '1',
                message: '登陆成功',
                user: action.user,
                token: action.token
            }
            break;
        case TYPES.LOGIN_IN_ERROR:
            return {
                ...state,
                status: '0',
                message: '登陆失败,' + action.message,
                user: null
            }
            break;
        default:
            return state;
    }

}
