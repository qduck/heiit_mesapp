import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Animated, ImageBackground, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';


const landmarkSize = 2;

const flashModeOrder = {
    off: 'on',
    on: 'auto',
    auto: 'torch',
    torch: 'off',
};

const wbOrder = {
    auto: 'sunny',
    sunny: 'cloudy',
    cloudy: 'shadow',
    shadow: 'fluorescent',
    fluorescent: 'incandescent',
    incandescent: 'auto',
};
const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;

const QC_IMAGE = require('../../assets/images/qc_scan.png');

export default class CameraScreen extends React.Component {
    state = {
        flash: 'off',
        zoom: 0,
        autoFocus: 'on',
        depth: 0,
        type: 'back',
        whiteBalance: 'auto',
        ratio: '16:9',
        ratios: [],
        photoId: 1,
        showGallery: false,
        photos: [],
        faces: [],
        anim: new Animated.Value(0),
    };

    scanBarcode = function (data) {
        if (this.camera) {
            this.props.navigation.state.params.callback(data.data);
            this.props.navigation.goBack();
        }
    };

    renderCamera() {
        return (
            <RNCamera
                ref={ref => {
                    this.camera = ref;
                }}
                style={{
                    flex: 1,
                }}
                type={this.state.type}
                flashMode={this.state.flash}
                autoFocus={this.state.autoFocus}
                zoom={this.state.zoom}
                whiteBalance={this.state.whiteBalance}
                ratio={this.state.ratio}
                faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.none}
                focusDepth={this.state.depth}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
                barCodeTypes={[RNCamera.Constants.BarCodeType.qr, RNCamera.Constants.BarCodeType.code128]}
                onBarCodeRead={this.scanBarcode.bind(this)}
            >
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{
                        flex: 1,
                        width: Dwidth,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }} />
                    <View
                        style={{ width: Dwidth, flexDirection: 'row' }}>
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }} />
                        <ImageBackground
                            style={styles.rectangle}
                            source={QC_IMAGE}>
                            <Animated.View style={[styles.animateStyle, {
                                transform: [{
                                    translateY: this.state.anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 200]
                                    })
                                }]
                            }]}>
                            </Animated.View>
                        </ImageBackground>
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }} />
                    </View>
                    <View style={{
                        flex: 1,
                        width: Dwidth,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }} />
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
        paddingTop: 10,
        backgroundColor: '#000',
    },
    navigation: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },
    animateStyle: {
        height: 2,
        backgroundColor: '#00FF00'
    },
    rectangle: {
        height: 200,
        width: 200,
    }
});
