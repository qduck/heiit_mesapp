import React, { Component } from 'react';

import { ScrollView, Text, TouchableWithoutFeedback, View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { WhiteSpace, WingBlank, Flex, Carousel } from '@ant-design/react-native';
import { PricingCard } from 'react-native-elements';
import { HTTPPOST, HTTPGET } from '../api/HttpRequest';
import { connect } from 'react-redux';
// import ErrorUtils from "ErrorUtils";
const AD_IMAGE1 = require('../../assets/ad/ad1.png');
const AD_IMAGE2 = require('../../assets/ad/ad2.png');
const AD_IMAGE3 = require('../../assets/ad/ad3.jpg');
const AD_IMAGE4 = require('../../assets/ad/ad4.jpg');
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
class IndexPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            appBtnes: [

            ],
            selectedTab: 'index',
            index_ades: [],
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


    render() {
        const { navigate } = this.props.navigation;
        let { status, user } = this.props;

        //Alert.alert(user.barRoleText);
        return (

            <ScrollView

                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}
            >
                <Carousel
                    style={styles.wrapper}
                    selectedIndex={2}
                    autoplay
                    infinite
                    vertical
                >
                    {/* <View
                            style={[styles.containerVertical, {}]}
                        >
                            <TouchableOpacity onPress={this.gotowebview.bind(this)}>
                                <Image resizeMode={'cover'} style={styles.adimg} source={AD_IMAGE1} />
                            </TouchableOpacity>
                        </View> */}
                    <View
                        style={[styles.containerVertical, {}]}
                    >
                        <TouchableOpacity >
                            <Image resizeMode={'cover'} style={styles.adimg} source={AD_IMAGE2} />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={[styles.containerVertical, {}]}
                    >
                        <TouchableOpacity >
                            <Image resizeMode={'cover'} style={styles.adimg} source={AD_IMAGE1} />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={[styles.containerVertical, {}]}
                    >
                        <TouchableOpacity >
                            <Image resizeMode={'cover'} style={styles.adimg} source={AD_IMAGE3} />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={[styles.containerVertical, {}]}
                    >
                        <TouchableOpacity >
                            <Image resizeMode={'cover'} style={styles.adimg} source={AD_IMAGE4} />
                        </TouchableOpacity>
                    </View>
                </Carousel>
                <Flex justify="between" style={styles.showboxarea}>
                    <View style={styles.showbox} >
                        <Text style={styles.showbox_title}>  技术释放 </Text>
                        <Text style={styles.showbox_value}> 000 </Text>
                    </View>
                    <View style={styles.showbox} >
                        <Text style={styles.showbox_title}>  合同排产 </Text>
                        <Text style={styles.showbox_value}> 000 </Text>
                    </View>
                    <View style={styles.showbox} >
                        <Text style={styles.showbox_title}>  完工入库 </Text>
                        <Text style={styles.showbox_value}> 000 </Text>
                    </View>
                    <View style={styles.showbox} >
                        <Text style={styles.showbox_title}>  发货 </Text>
                        <Text style={styles.showbox_value}> 000 </Text>
                    </View>
                </Flex>
                <Text>建设中</Text>
            </ScrollView>



        );
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token,
    })
)(IndexPage)

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
        width: SCREEN_WIDTH / 4 - 7,
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
    }
});