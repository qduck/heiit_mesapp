package com.xioliftmes;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.baidu.tts.client.SpeechSynthesizer;
import com.baidu.tts.client.SpeechSynthesizerListener;
import com.baidu.tts.client.TtsMode;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Description: 调用百度语音合成
 */
public class BaiduTts extends ReactContextBaseJavaModule {

    private static final String APP_ID = "16381734";

    private static final String API_KEY = "hWjz421kjz0CBakrD5qgGGlR";

    private static final String SECRET_KEY = "6yrTwAxnvK7df6CnF0OcVUXtqCfPt8Ix";

    // TtsMode.MIX; 离在线融合，在线优先； TtsMode.ONLINE 纯在线； 没有纯离线
    private static final TtsMode ttsMode = TtsMode.MIX;

    protected Context context;

    private SpeechSynthesizer mSpeechSynthesizer;

    public BaiduTts(ReactApplicationContext reactContext) {
        super(reactContext);

        this.context = reactContext;

        // 初始化
        this.mSpeechSynthesizer = SpeechSynthesizer.getInstance();
        mSpeechSynthesizer.setContext(this.context);
        mSpeechSynthesizer.setAppId(APP_ID);
        mSpeechSynthesizer.setApiKey(API_KEY, SECRET_KEY);
        // this.mSpeechSynthesizer.auth(this.ttsMode);
        mSpeechSynthesizer.initTts(TtsMode.ONLINE);
    }

    @Override
    public String getName() {
        return "BaiduTts";
    }

    // @Nullable
    // @Override
    // public Map<String, Object> getConstants() {
    // final Map<String, Object> constants = new HashMap<>();
    // // constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    // // constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    // return constants;
    // }

    @ReactMethod
    public int speak(String message) {
        // 初始化一个AipSpeech

        return mSpeechSynthesizer.speak(message);
    }

}