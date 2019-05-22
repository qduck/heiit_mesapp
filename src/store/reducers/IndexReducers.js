/**
 * create by qduck on 2017/09/22
 * 事件分发 总模块
 */
import { combineReducers } from 'redux';
import loginIn from './item/LoginReducer';

const rootReducer = combineReducers({
    loginIn: loginIn
})

export default rootReducer;//导出，作为统一入口
