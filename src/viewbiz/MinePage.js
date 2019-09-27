import React, { Component } from 'react';

import { ScrollView, Text, TouchableWithoutFeedback, View, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, Alert } from 'react-native';
import { WhiteSpace, WingBlank, Flex, Carousel, Card, List, Portal, Toast, Provider } from '@ant-design/react-native';
import { PricingCard, Avatar } from 'react-native-elements';
import { HTTPPOST, HTTPGET } from '../api/HttpRequest';
import { connect } from 'react-redux';
import codePush from "react-native-code-push";
import Config from 'react-native-config';
// import ErrorUtils from "ErrorUtils";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const Item = List.Item;
// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
class MinePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            appBtnes: [

            ],
            selectedTab: 'index',
            index_ades: [],
            modalVisible: false,
            downloadProgess: 0
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
    //检查程序更新
    checkAppUpdate() {
        let deploymentKey = Config.Code_Push_deploymentKey;
        codePush.checkForUpdate(deploymentKey).then((update) => {
            if (!update) {
                Alert.alert("程序已是最新版本！", "程序版本已经为最新版本！");
                this.setState({ modalVisible: false });
            } else {
                codePush.sync({
                    deploymentKey: deploymentKey,
                    updateDialog: {
                        appendReleaseDescription: true,
                        descriptionPrefix: "\n\n更新說明:\n",
                        mandatoryContinueButtonLabel: "立即更新",
                        mandatoryUpdateMessage: "发现重要更新,必須更新后才能使用!",
                        optionalIgnoreButtonLabel: '稍后',
                        optionalInstallButtonLabel: '立即更新',
                        optionalUpdateMessage: '有新版本了，是否更新？',
                        title: '更新提示'
                    },
                    installMode: codePush.InstallMode.IMMEDIATE,
                },
                    (status) => {
                        switch (status) {
                            case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                                this.setState({ modalVisible: true });
                                break;
                            case codePush.SyncStatus.INSTALING_UPDATE:
                                this.setState({ modalVisible: false });
                                break;
                            case codePush.SyncStatus.UP_TO_DATE:
                                this.setState({ modalVisible: false });
                                Toast.info('版本已最新 !!!', 1, undefined, false);
                                break;
                            case codePush.SyncStatus.UPDATE_INSTALLED:
                                this.setState({ modalVisible: false });
                                break;
                            case codePush.SyncStatus.SYNC_IN_PROGRESS:
                                this.setState({ modalVisible: false });
                                Toast.info('版本已最新，跳过 !!!', 1, undefined, false);
                                break;
                            case codePush.SyncStatus.CHECKING_FOR_UPDATE:
                                this.setState({ modalVisible: false });
                                break;
                            default:
                                Toast.info('其他同步状态 !!!', 1, undefined, false);
                        }
                    },
                    (progress) => {
                        let receivedBytes = progress.receivedBytes;
                        let totalBytes = progress.totalBytes;
                        let downloadProgess = (receivedBytes / totalBytes).toFixed(2);
                        this.setState({ downloadProgess: downloadProgess });
                        //console.log(progress.receivedBytes + " of " + progress.totalBytes + " received.");
                    }
                );
            }
        }).catch((error) => {
            LogException('程序更新异常！' + error);
            return;
        })
    }

    render() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;
        let { modalVisible, downloadProgess } = this.state;
        let percentProgess = String(parseInt(downloadProgess * 100)) + '%';
        //Alert.alert(user.barRoleText);
        return (
            <Provider>
                <ScrollView

                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                >
                    <WingBlank size="sm">
                        <WhiteSpace size='sm' />
                        <Card >
                            <Card.Body>

                                <Flex justify="between">
                                    <View style={styles.mycardTitle}>
                                        <Text style={styles.mycardTitleFont}>{user.cname}</Text>
                                        <Text>{"公司：" + user.companysID}</Text>
                                        <Text>{"职务："}</Text>
                                    </View>
                                    <View style={styles.mycardAvatar}>
                                        <Avatar
                                            size="medium"
                                            rounded
                                            title="MT"
                                            onPress={() => console.log("Works!")}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </Flex>

                            </Card.Body>
                        </Card>
                        <WhiteSpace size='lg' />
                    </WingBlank>
                    <List  >
                        <Item extra="" arrow="horizontal" onPress={this.checkAppUpdate.bind(this)}>
                            检查程序版本
          </Item>
                    </List>
                    <Modal
                        visible={modalVisible}
                        animated={'slide'}
                        transparent={true}
                        onRequestClose={() => this.setState({ modalVisible: false })}
                    >
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: SCREEN_WIDTH * 0.6, height: 20, borderRadius: 10, backgroundColor: '#e5e5e5' }}>
                                        <View style={{ width: SCREEN_WIDTH * 0.6 * downloadProgess, height: 20, borderRadius: 10, backgroundColor: '#ff6952' }}></View>
                                    </View>
                                    <Text style={{ color: '#fff', marginLeft: 10, fontSize: 14 }}>{percentProgess}</Text>
                                </View>
                                <Text style={{ color: '#fff', marginTop: 12 }}>{downloadProgess < 1 ? '正在下载更新资源包,请稍候。。。' : '下载完成,应用即將重启'}</Text>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>

            </Provider>

        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token,
    })
)(MinePage)

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
    },
    containerHorizontal: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    containerVertical: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    adimg: {
        height: 150,
        width: SCREEN_WIDTH,
    },
    text: {
        color: '#fff',
        fontSize: 36,
    },
    showboxarea: {
        padding: 5,
    },
    showbox: {
        width: 80,
        height: 55,
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: '#525252',
        padding: 5,
    },
    showbox_title: {
        fontSize: 12,
        color: '#FFF'
    },
    showbox_value: {
        fontSize: 22,
        color: '#FFF',
    },
    mycardTitle: {
        padding: 10,
        width: 200,
        alignContent: 'flex-end',
    },
    mycardAvatar: {
        padding: 10,
        width: 200,
        flex: 1,
        alignItems: 'flex-end',
    },
    mycardTitleFont: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});