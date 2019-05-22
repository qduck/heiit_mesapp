import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Animated, ImageBackground, Dimensions, WebView } from 'react-native';

const Dwidth = Dimensions.get('window').width;
const Dheight = Dimensions.get('window').height;

export default class WebPageView extends React.Component {
    state = {

    };

    render() {
        return (<WebView
            source={{ uri: 'https://mp.weixin.qq.com/s/Dy049ofetXLgtXWSH7Mb4w' }}

        />);
    }
}

const styles = StyleSheet.create({

});
