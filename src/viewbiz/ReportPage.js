import React, { Component } from 'react';

import { ScrollView, Text, TouchableWithoutFeedback, View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { WhiteSpace, WingBlank, Flex, Carousel, Card } from '@ant-design/react-native';
import { PricingCard } from 'react-native-elements';
import { HTTPPOST, HTTPGET } from '../api/HttpRequest';
import { connect } from 'react-redux';
import { Echarts, echarts } from 'react-native-secharts';
// import ErrorUtils from "ErrorUtils";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// ErrorUtils.setGlobalHandler((e) => {

//     //发生异常的处理方法,当然如果是打包好的话可能你找都找不到是哪段代码出问题了
//     Alert.alert("异常", JSON.stringify(e))
// });
class ReportPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            appBtnes: [

            ],
            selectedTab: 'index',
            index_ades: [],
            chartOption1: {
                title: {
                    text: 'ECharts demo'
                },
                tooltip: {},
                legend: {
                    data: ['销量']
                },
                xAxis: {
                    data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                    axisLabel: {//坐标轴刻度标签的相关设置。
                        interval: 0,
                        rotate: "45"
                    }
                },
                yAxis: {},
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }]
            }
        }
        this.echart1 = React.createRef();
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
                <WingBlank size="sm">
                    <WhiteSpace size="sm" />
                    <Card>
                        <Card.Header
                            title="测试MES管理报表"
                        />
                        <Card.Body>
                            <Echarts ref={this.echart1} option={this.state.chartOption1} height={300} />
                        </Card.Body>
                    </Card>

                </WingBlank>
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
)(ReportPage)

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
    }
});