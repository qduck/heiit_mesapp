import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, InteractionManager, TouchableHighlight } from 'react-native';
import { Input, Button, Header, CheckBox } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex, List, Switch } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST } from '../../api/HttpRequest';
import ModalDropdown from 'react-native-modal-dropdown';

import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast'
// import ErrorUtils from "ErrorUtils";

// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


class FQCLianDongHandle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pono: '',
            pono_valid: true,

            orderno_emessage: '',
            orderno_focused: true,  //默认选中
            orderno: '', //检验合同号

            fqcboxes: [], //检验箱子数据
            handlemethodes: [{
                name: "退换货"
            }, {
                name: "现场返工"
            }, {
                name: "让步接收"
            }, {
                name: "缺件发货"
            }], //不需要检验的箱子数据

            boxselected: null,  //被选中要新增的检验箱子

            addboxLoading: false,
            submitLoading: false,
            searchloading: false,

            checked: false,
        };
        //const navigate = this.props.navigation;

        this.checkorderno = this.checkorderno.bind(this);

    }

    onSwitchChange(index, obj, event) {
        let obj1 = JSON.parse(JSON.stringify(this.state.fqcboxes));
        let newobj = obj1[index];
        if (newobj.isldhg == '不合格' || newobj.ispdhg == '不合格') {
            newobj.isldhg = '合格';
            newobj.ispdhg = '合格';
        } else {
            newobj.isldhg = '不合格';
            newobj.ispdhg = '不合格';
        }
        obj1.splice(index, 1, newobj);
        this.setState({ fqcboxes: obj1 });
    }


    checkorderno(val) {
        this.setState({ orderno: val });
    }

    //提交扫描结果
    async submitForm() {


        let { status, user, token } = this.props;

        if (this.state.fqcboxes.length <= 0) {
            Alert.alert('错误', '没有可提交的处理信息，请确认！');
            return;
        }
        this.state.fqcboxes.forEach(item => {
            if (item.isldhg != '不合格') {
                item.isldhg = '合格'
            }
        });

        let data = {
            smList: this.state.fqcboxes,
            smtype: '',
            userCode: user.code,
            userName: user.loginName,
        }

        HTTPPOST('/sm/updateBoxUnHG', data, token)
            .then((res) => {
                if (res.code >= 1) {

                    this.refs.toast.show('提交不合格处理结果成功！');

                    this.setState({ orderno: '' });
                    this.setState({ fqcboxes: [] });
                    //this.setState({ otherboxes: [] });

                    this.refs.textInput1.focus();
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('错误', '提交不合格处理失败，' + res.msg);
                }
                //this.setState({ submitLoading: false });

            }).catch((error) => {
                Alert.alert('错误', error.msg);
                //this.setState({ submitLoading: false });
            });
        //
    }

    showCamera() {
        const { navigate } = this.props.navigation;
        navigate('ScannerCode',
            {
                callback: (backData) => {
                    this.setState({
                        pono: backData
                    });
                }
            })
    }


    async componentDidMount() {

        await InteractionManager.runAfterInteractions();
        this.props.navigation.navigate('DrawerClose');
    }
    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        let { status } = this.props;
        const { navigate } = this.props.navigation;
        if (status != '1') {
            navigate('Login');
        }
    }
    componentWillUnmount() {
        this.state.fqcboxes.forEach((item, index) => {
            let dropdownname = "handlemselecter" + index.toString()
            this.refs[dropdownname].hide();
        });
    }

    //从服务端获取需要做成品检验的不合格箱子信息
    getboxes() {
        let { status, user, token } = this.props;
        let theorderno = "";
        if (this.state.orderno.indexOf('  ') >= 0) {
            //扫描的信息为唛头条码
            theorderno = this.state.orderno.substring(0, this.state.orderno.indexOf('  '));
        } else {
            theorderno = this.state.orderno;
        }
        if (theorderno == "") {
            Alert.alert('错误', '请扫描合同号！');
            return;
        }

        let datareq = {
            hth: theorderno,
            // smtype: '0', //0表示拼搭，1表示联动
            //hgtype: '',  //为空，查询待检验箱子
        }
        this.setState({ searchloading: true });
        HTTPPOST('/sm/getHTHBoxInfo', datareq, token)
            .then((res) => {
                if (res.code >= 1) {
                    if (res.list && res.list.length) {

                        let qcboxlist = [];
                        let otherboxlist = [];
                        res.list.forEach(qcitem => {
                            if (qcitem.isldhg == '不合格') {
                                qcboxlist.push(qcitem);
                            }
                        });

                        this.setState({ fqcboxes: qcboxlist });  //待检验箱子数据
                        // this.setState({ otherboxes: otherboxlist });
                        this.refs.toast.show('合同【' + theorderno + '】联动不合格箱子，接收成功！');
                        this.setState({ searchloading: false });
                    } else {
                        this.refs.toast.show('合同【' + theorderno + '】，无不合格箱！');
                        this.setState({ searchloading: false });
                    }
                    //that.setState({ pono_focused: true });
                    //this.setState({ pono: '' });
                } else {
                    Alert.alert('错误', '合同[' + theorderno + ']，' + res.msg, [{ text: 'OK', onPress: () => this.refs.textInput1.focus() }]);
                    this.setState({ searchloading: false });
                }
                //
            }).catch((error) => {
                Alert.alert('异常', error);
                this.setState({ searchloading: false });
            });
    }

    //添加箱子到待检验清单中


    //回到主页
    gohome() {
        const { navigate } = this.props.navigation;
        navigate('Index');
    }

    selectaddbox_renderButtonText(rowData) {
        const { name } = rowData;
        return `${name}`;
    }

    selectaddbox_renderRow(rowData, rowID, highlighted) {
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={styles.selectrow}>
                    <Text>
                        {`${rowData.name}`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    selectaddbox_onSelect(idx, value, index) {
        // BUG: alert in a modal will auto dismiss and causes crash after reload and touch. @sohobloo 2016-12-1
        //Alert.alert(`idx=${idx}, value='${value}'`);
        //console.debug(`idx=${idx}, value='${value}'`);
        let obj1 = JSON.parse(JSON.stringify(this.state.fqcboxes));
        let newobj = obj1[index];
        newobj.ldremark = value.name;
        obj1.splice(index, 1, newobj);
        this.setState({ fqcboxes: obj1 });
    }

    render() {
        return (
            <ScrollView >
                <Header
                    placement="left"
                    leftComponent={{ icon: 'home', color: '#fff', onPress: this.gohome.bind(this) }}
                    centerComponent={{ text: '成品检验不合格处理', style: { color: '#fff', fontWeight: 'bold' } }}
                    containerStyle={styles.headercontainer}
                />
                <WingBlank>
                    <WhiteSpace />
                    <View style={styles.textIconInput}>
                        <Input ref="textInput1"
                            label="不合格合同号："
                            type="text" value={this.state.orderno}
                            onChangeText={this.checkorderno}
                            onSubmitEditing={this.getboxes.bind(this)}
                            autoFocus={this.state.orderno_focused}
                            style={styles.inputS}
                            keyboardType="email-address"
                            errorMessage={this.state.orderno_emessage}
                            selectTextOnFocus={true}
                        />

                    </View>
                    <WhiteSpace />
                    <Flex style={{ padding: 10 }} justify="between">
                        <Text style={{ fontWeight: 'bold' }}>不合格箱列表：</Text>
                        <Text style={{ fontWeight: 'bold' }}>处理结果</Text>
                    </Flex>
                    <ScrollView style={styles.partlistclass} showsVerticalScrollIndicator={true}>
                        <List>
                            {
                                this.state.fqcboxes.map((l, index) => (
                                    <List.Item key={l.pkid}
                                        extra={
                                            <Text>
                                                {(l.isldhg == '不合格' || l.ispdhg == '不合格') ? ' [不合格]' : ' [合格]'}
                                                <ModalDropdown options={this.state.handlemethodes}
                                                    style={styles.Selecter}
                                                    textStyle={styles.SelecterText}
                                                    dropdownStyle={styles.SelecterDropDown}
                                                    renderButtonText={(rowData) => this.selectaddbox_renderButtonText(rowData)}
                                                    renderRow={this.selectaddbox_renderRow.bind(this)}
                                                    onSelect={(idx, value) => this.selectaddbox_onSelect(idx, value, index)}
                                                    ref={"handlemselecter" + index.toString()}
                                                />
                                                <Switch
                                                    color="red"
                                                    checked={(l.isldhg == '不合格' || l.ispdhg == '不合格') ? true : false}
                                                    onChange={this.onSwitchChange.bind(this, index, l)}
                                                />
                                            </Text>
                                        }
                                    >
                                        {l.boxName}
                                        {<Text style={{ fontSize: 10 }}>
                                            {l.mt}</Text>
                                        }
                                    </List.Item>
                                ))
                            }
                        </List>
                    </ScrollView>



                    <WhiteSpace />

                    <Flex justify="between">
                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.getboxes.bind(this)}
                            loading={this.state.searchloading}
                            title='查询不合格项' />

                        <Button backgroundColor='#6495ed' activeOpacity={1}
                            onPress={this.submitForm.bind(this)}
                            loading={this.state.submitLoading}
                            title='提交处理结果' />
                    </Flex>

                    <Toast ref="toast" position="top" positionValue={2} opacity={0.6} />
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
)(FQCLianDongHandle)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
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
    },
    inputS: {
        paddingRight: 0, marginRight: 0,
    },
    Selecter: {
        height: 30,
        width: 150,
        backgroundColor: '#FFF',
        borderBottomColor: '#666',
        borderBottomWidth: 1,
    },
    SelecterText: {
        fontSize: 12,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 0,
    },
    SelecterDropDown: {
        width: 100,
        height: 120,
    },
    selectrow: {
        padding: 5,
    },
    addboxbtn: {
        height: 25,
        width: 60,
    },
    partlistclass: {
        padding: 5,
        height: SCREEN_HEIGHT - 285,
    },
    checkboxarea: {
        alignItems: 'flex-end',
        width: 100,
        paddingLeft: 100,
        marginLeft: 100,
        alignSelf: 'flex-end',
    },
    checkbox: {
        padding: 3,
        paddingLeft: 5,
        margin: 2,
        marginRight: 0,
        width: 80,
    }
});