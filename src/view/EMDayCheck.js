import React from 'react';
import {
    Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, ToastAndroid,
    Platform, TextInput, ScrollView,
} from 'react-native';
import { Input, Button, Header } from 'react-native-elements';
import { WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HTTPPOST } from '../api/HttpRequest';

import { connect } from 'react-redux';
import NfcManager, { Ndef } from 'react-native-nfc-manager';


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;



class EMDayCheck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            supported: true,
            enabled: false,
            isWriting: false,
            tag: {},
            parsed: null,
            detectioning: false
        }
    }

    componentDidMount() {
        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    this._startNfc();
                }
            })
    }

    componentWillUnmount() {
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }
    }

    render() {
        let { supported, enabled, tag, isWriting, parsed, detectioning } = this.state;
        return (
            <ScrollView  >
                <WingBlank>

                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.btngroup}>
                            <Button backgroundColor='#6495ed' activeOpacity={1}
                                onPress={this._startDetection}
                                loading={detectioning}

                                title='开始记录巡检信息' />

                            <Button backgroundColor='#c0c0c0' activeOpacity={1}
                                onPress={this._stopDetection}
                                title='巡检完成' />
                        </View>


                        <TouchableOpacity style={{ marginTop: 20 }} onPress={this._clearMessages}>
                            <Text>Clear</Text>
                        </TouchableOpacity>

                        <Text style={{ marginTop: 20 }}>{`Current tag JSON: ${JSON.stringify(tag)}`}</Text>

                    </View>
                </WingBlank>
            </ScrollView>
        )
    }

    _requestNdefWrite = () => {
        let { isWriting } = this.state;
        if (isWriting) {
            return;
        }

        let bytes = Ndef.encodeMessage([
            Ndef.textRecord("hello, world"),
            Ndef.uriRecord("http://nodejs.org"),
        ]);

        this.setState({ isWriting: true });
        NfcManager.requestNdefWrite(bytes)
            .then(() => console.log('write completed'))
            .catch(err => console.warn(err))
            .then(() => this.setState({ isWriting: false }));
    }

    _cancelNdefWrite = () => {
        this.setState({ isWriting: false });
        NfcManager.cancelNdefWrite()
            .then(() => console.log('write cancelled'))
            .catch(err => console.warn(err))
    }

    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({ supported: false });
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    this.setState({ enabled });
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        this.setState({ enabled: true });
                    } else if (event.state === 'off') {
                        this.setState({ enabled: false });
                    } else if (event.state === 'turning_on') {
                        // do whatever you want
                    } else if (event.state === 'turning_off') {
                        // do whatever you want
                    }
                }
            )
                .then(sub => {
                    this._stateChangedSubscription = sub;
                    // remember to call this._stateChangedSubscription.remove()
                    // when you don't want to listen to this anymore
                })
                .catch(err => {
                    console.warn(err);
                })
        }
    }

    _onTagDiscovered = tag => {
        console.log('Tag Discovered', tag);
        this.setState({ tag });

        // let parsed = null;
        // if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        //     // ndefMessage is actually an array of NdefRecords, 
        //     // and we can iterate through each NdefRecord, decode its payload 
        //     // according to its TNF & type
        //     const ndefRecords = tag.ndefMessage;

        //     function decodeNdefRecord(record) {
        //         if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
        //             return ['text', Ndef.text.decodePayload(record.payload)];
        //         } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
        //             return ['uri', Ndef.uri.decodePayload(record.payload)];
        //         }

        //         return ['unknown', '---']
        //     }

        //     parsed = ndefRecords.map(decodeNdefRecord);
        // }

        // this.setState({ parsed });
    }

    _startDetection = () => {
        NfcManager.registerTagEvent(this._onTagDiscovered)
            .then(result => {
                this.setState({ detectioning: true });
                console.log('registerTagEvent OK', result);
            })
            .catch(error => {
                console.warn('registerTagEvent fail', error)
            })
    }

    _stopDetection = () => {
        NfcManager.unregisterTagEvent()
            .then(result => {
                this.setState({ detectioning: false });
                console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                console.warn('unregisterTagEvent fail', error)
            })
    }

    _clearMessages = () => {
        this.setState({ tag: null, parsed: null });
    }
}

export default connect(
    (state) => ({
        status: state.loginIn.status,
        user: state.loginIn.user,
        token: state.loginIn.token
    })
)(EMDayCheck)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        justifyContent: 'flex-start',

    },
    textIconInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    inputS: {
        paddingRight: 0, marginRight: 0,
    },
    btngroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        top: 20,
        marginLeft: "auto",
        marginRight: "auto",
        width: SCREEN_WIDTH - 30,
    }
});