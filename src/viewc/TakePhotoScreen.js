import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-elements';

export default class TakePhotoScreen extends React.Component {
    state = {
        flash: RNCamera.Constants.FlashMode.on,
        tackpicloading: false,
        type: RNCamera.Constants.Type.back,
    };


    takePicture = async function () {
        // const { navigate } = this.props.navigation;
        // if (this.camera) {
        //     this.props.navigation.state.params.callback(data.data);
        //     this.props.navigation.goBack();
        // }
        if (this.camera) {
            this.setState({ tackpicloading: true });
            const options = { quality: 0.9, base64: true };
            await this.camera.takePictureAsync(options).then(data => {

                this.props.navigation.state.params.callback(data);
                this.setState({ tackpicloading: false });
                this.props.navigation.goBack();
            }).catch(error => {
                this.setState({ tackpicloading: false });
                this.props.navigation.goBack();
            });
            this.setState({ tackpicloading: false });
            this.props.navigation.goBack();
            // this.props.navigation.state.params.callback(data);
            // this.props.navigation.goBack();
            //     .then(data => {
            //     navigate.state.params.callback(data);
            //     navigate.goBack();
            // }).catch(function (error) {
            //     navigate.goBack();
            // });
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
                faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.none}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
            >
                <View
                    style={{
                        flex: 0.4,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}
                >
                </View>
                <View
                    style={{
                        flex: 0.4,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        alignSelf: 'flex-end',
                    }}
                >

                </View>
                <View
                    style={{
                        flex: 0.1,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Button
                        style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end' }]}
                        onPress={this.takePicture.bind(this)}
                        loading={this.state.tackpicloading}
                        title='拍照' />
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
    gallery: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        marginBottom: 10,
        marginTop: 20,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flipText: {
        color: 'white',
        fontSize: 15,
    },

    picButton: {
        backgroundColor: 'darkseagreen',
    },
    galleryButton: {
        backgroundColor: 'indianred',
    },

    row: {
        flexDirection: 'row',
    },
});
