import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Animated, ImageBackground, Dimensions, InteractionManager } from 'react-native';
import { RNCamera } from 'react-native-camera';


const { width, height } = Dimensions.get('window');

export default class CameraScreen extends React.Component {
    state = {
        autoFocus: 'on',
        depth: 0,
        type: 'back',

        codetype: [RNCamera.Constants.BarCodeType.qr, RNCamera.Constants.BarCodeType.code128], // 条码类型
        animate: new Animated.Value((width - 200) / 2, (height - 340) / 2),
        show: true,
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.startAnimation();
        })
    }
    componentWillUnmount() {
        this.setState({ show: false });
    }

    scanBarcode = function (data) {
        if (this.state.show && this.camera) {
            this.props.navigation.state.params.callback(data.data);
            this.props.navigation.goBack();
        }
    };
    // 动画开始
    startAnimation() {
        if (this.state.show) {
            this.state.animate.setValue(0);
            Animated.timing(this.state.animate, {
                toValue: 1,   // 运动终止位置，比值
                duration: 2500,  // 动画时长
                easing: Easing.linear,  // 线性的渐变函数
                delay: 0.5,// 在一段时间之后开始动画（单位是毫秒），默认为0
            }).start(() => this.startAnimation())
        }
    }

    renderCamera() {
        return (
            <RNCamera
                ref={ref => {
                    this.camera = ref;
                }}
                style={styles.camera}
                autoFocus={this.state.autoFocus}
                permissionDialogTitle={'摄像头权限！'}
                permissionDialogMessage={'需要开通摄像头访问权限。'}
                barCodeTypes={this.state.codetype}
                onBarCodeRead={this.scanBarcode.bind(this)}
                onCameraReady={() => {
                    console.log('ready')
                }}
            >
                <View style={styles.box}>
                    <View style={styles.kuang}>
                        <Animated.View style={{
                            alignItems: 'center',
                            transform: [{
                                // translateX: x轴移动
                                // translateY: y轴移动
                                translateY: this.state.animate.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 200]
                                })
                            }]
                        }}>
                            <Text style={{ width: 250, height: 1, backgroundColor: '#00ff00' }}></Text>
                        </Animated.View>
                    </View>
                </View>
            </RNCamera>
        );
    }

    render() {
        return <View style={styles.container}>{this.renderCamera()}</View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    box: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    kuang: {
        width: 260,
        height: 260,
        borderWidth: 1,
        borderColor: 'skyblue',
        backgroundColor: '#rgba(255,255,255,0.1)'
    }
});
