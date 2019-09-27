import React, { Component } from 'react';

import { ScrollView, Text, TouchableWithoutFeedback, View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { WhiteSpace, WingBlank, Flex, Carousel, Card, List, Portal, Toast, Provider, Button, Picker, Switch, TextareaItem, Icon, InputItem, Tabs } from '@ant-design/react-native';
import { HTTPPOST, HTTPGET } from '../api/HttpRequest';
import { connect } from 'react-redux';
// import ErrorUtils from "ErrorUtils";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const Item = List.Item;
const Brief = Item.Brief;
// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
class WorkMsg extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            appBtnes: [

            ],
            selectedTab: 'index',
            index_ades: [],
            //选择缺件部件数据
            dataWOPartnoList: [
                { value: '111', label: '1111', children: [] },
                { value: '222', label: '2222', children: [] },
                { value: '333', label: '3333', children: [] },
                { value: '444', label: '4444', children: [] },
                { value: '555', label: '5555', children: [] },
                { value: '666', label: '6666', children: [] },
                { value: '777', label: '7777', children: [] },
                { value: '888', label: '8888', children: [] },
                { value: '999', label: '9999', children: [] },
                { value: '0000', label: '0000', children: [] },
                { value: 'AAAA', label: 'AAAA', children: [] },
            ],
            andonForm_partno: "",
            andonForm_isStopWork: false,
            //异常分类
            exceptionTypes: [
                { id: 1, label: '设备故障' },
                { id: 2, label: '工艺工装' },
                { id: 3, label: '信息系统' },
                { id: 4, label: 'IT 设备' },
                { id: 5, label: '缺 件' },
                { id: 6, label: '质量件' },
                { id: 7, label: '其 他' },
            ],
            focusException: 1
        }
    }

    //跳转到详情页面
    NaviTo(name) {
        const { navigate } = this.props.navigation;
        navigate(name)
    }


    //在渲染前调用,在客户端也在服务端
    componentWillMount() {
        const { navigate } = this.props.navigation;
        let { status, user, token } = this.props;
        navigate('DrawerClose');

        if (status != '1') {
            navigate('Login');
        }

        if (token) {
            //let adobj = [];

            // HTTPGET('/sm/show-picture/ad1', token)
            //     .then((res) => {
            //         adobj.push(res);
            //         this.setState({ index_ades: adobj });
            //     }).catch((error) => {
            //         Alert.alert(error);

            //     });
        }

    }

    gotowebview() {
        const { navigate } = this.props.navigation;
        navigate('WebShow');
    }


    onPartChange(value) {
        this.setState({ andonForm_partno: value });
    }
    onPartPress() {

    }
    stopWorkSwitchChange(value) {
        this.setState({
            andonForm_isStopWork: value,
        });
    }

    submitForm() {

    }

    renderAndonBtns() {
        if (exceptionTypes && exceptionTypes.length >= 1) {
            return (<View>
                {
                    exceptionTypes.map((item, index) => {
                        return this.renderAndonBtn(item, index)
                    })
                }
            </View>)
        } else {
            return;
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;
        const tabstyle = {
            height: 200,
            backgroundColor: '#fff',
        };
        const tabs = [{ title: '异常上报' }, { title: '已上报清单-12' }];
        //Alert.alert(user.barRoleText);
        return (
            <Provider>
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                >


                    <View style={styles.andonBtnsView}>
                        <Flex justify="between">

                            <Button style={styles.andonBtn}>

                                <Text style={styles.andonBtnFront}>设备故障</Text>
                            </Button>

                            <Button style={styles.andonBtn}>

                                <Text style={styles.andonBtnFront}>工艺工装</Text>
                            </Button>

                            <Button style={styles.andonBtn}>

                                <Text style={styles.andonBtnFront}>信息系统</Text>
                            </Button>
                            <Button style={styles.andonBtn}>

                                <Text style={styles.andonBtnFront}>IT 设备</Text>
                            </Button>
                        </Flex>
                        <Flex justify="between">

                            <Button style={styles.andonBtnActive}>
                                <Text style={styles.andonBtnFront}>缺件</Text>
                            </Button>

                            <Button style={styles.andonBtn}>
                                <Text style={styles.andonBtnFront}>质量件</Text>
                            </Button>

                            <Button style={styles.andonBtn}>
                                <Text style={styles.andonBtnFront}>其他</Text>
                            </Button>
                        </Flex>
                    </View>
                    <WhiteSpace size='sm' />
                    <WingBlank size="sm" >
                        <View style={styles.tabsContainView}>
                            <Tabs tabs={tabs}>
                                <View style={tabstyle} >
                                    <List>
                                        <List.Item>
                                            <Text style={styles.andonFormFront}>异常标题：</Text>
                                            <TextareaItem rows={4} placeholder="请简要描述下异常！" />
                                        </List.Item>
                                        <List.Item
                                            extra={
                                                <Switch
                                                    color="red"
                                                    checked={this.state.andonForm_isStopWork}
                                                    onChange={this.stopWorkSwitchChange.bind(this)}
                                                />
                                            }
                                        >
                                            <Text style={styles.andonFormFront}>是否已停线？: {this.state.andonForm_isStopWork ? '是' : '否'}
                                            </Text>
                                        </List.Item>
                                        <Picker
                                            title="缺件部件选择"
                                            data={this.state.dataWOPartnoList}
                                            cols={1}
                                            value={this.state.andonForm_partno}
                                            onChange={this.onPartChange.bind(this)}


                                        >
                                            <List.Item arrow="horizontal" onPress={this.onPartPress}>
                                                <Text style={styles.andonFormFront}>缺件部件：</Text>
                                            </List.Item>
                                        </Picker>


                                        <Item
                                            extra={
                                                <Icon name="camera" />
                                            }
                                            arrow="empty"
                                            multipleLine
                                        >
                                            <Flex direction="row" justify="between">
                                                <Text style={styles.andonFormImgFront}>问题照片：</Text>
                                                <Image
                                                    source={{
                                                        uri:
                                                            'https://os.alipayobjects.com/rmsportal/mOoPurdIfmcuqtr.png',
                                                    }}
                                                    style={{ width: 29, height: 29, marginRight: 10 }}
                                                />
                                            </Flex>
                                        </Item>
                                        <Item
                                            extra={
                                                <Icon name="video-camera" />
                                            }
                                            arrow="empty"
                                            multipleLine
                                        >
                                            <Flex direction="row" justify="between">
                                                <Text style={styles.andonFormImgFront}>问题视频：</Text>
                                                <Image
                                                    source={{
                                                        uri:
                                                            'https://os.alipayobjects.com/rmsportal/mOoPurdIfmcuqtr.png',
                                                    }}
                                                    style={{ width: 29, height: 29, marginRight: 10 }}
                                                />
                                            </Flex>
                                        </Item>
                                        <List.Item>
                                            <Flex justify="between" wrap="nowrap">
                                                <Button type="primary"
                                                    style={styles.submitBtn}
                                                    onPress={this.submitForm.bind(this)}
                                                    loading={this.state.submitLoading}>
                                                    <Text style={{ fontSize: 14 }}>提交</Text>
                                                </Button>
                                            </Flex>
                                        </List.Item>
                                    </List>

                                </View>
                                <View style={tabstyle}>
                                    <Text style={{ fontSize: 14 }}>异常列表【12】</Text>
                                </View>

                            </Tabs>
                        </View>
                    </WingBlank>
                </ScrollView>
            </Provider >
        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token,
    })
)(WorkMsg)

const styles = StyleSheet.create({

    andonBtnsView: {
        padding: 4,
        backgroundColor: "#FFF",
    },
    andonBtn: {
        margin: 2,
        height: 36,
        width: 80,
        marginBottom: 5,
        overflow: 'hidden',
    },
    andonBtnActive: {
        margin: 2,
        height: 36,
        width: 80,
        marginBottom: 5,
        backgroundColor: "#7EC0EE",
        overflow: 'hidden',
    },
    andonBtnFront: {
        fontSize: 12
    },
    andonFormFront: {
        fontSize: 14,
        color: '#666'
    },
    andonFormImgFront: {
        fontSize: 14,
        color: '#666',

    },
    andonFormImgIcon: {

        paddingRight: 10,
    },
    andonFormItem: {
        padding: 2,
        paddingLeft: 7,
    },
    submitBtn: {
        width: 80,
        height: 36
    },
    tabsContainView: {
        backgroundColor: "#FFF",
        height: SCREEN_HEIGHT - 180
    }
});