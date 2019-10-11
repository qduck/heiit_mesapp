package com.xioliftmes;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.microsoft.codepush.react.CodePush;
import cn.jpush.android.api.JPushInterface;//极光推送

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "XioLiftMES";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 这里定义了在加载js的时候，同时弹起启动屏
        // 第二个参数true，是启动页全屏显示，隐藏了状态栏。
        // SplashScreen.show(this, true);

        JPushInterface.init(this);// 极光推送
    }

    // @Override
    // protected ReactActivityDelegate createReactActivityDelegate() {
    // return new ReactActivityDelegate(this, getMainComponentName()) {
    // @Override
    // protected ReactRootView createRootView() {
    // return new RNGestureHandlerEnabledRootView(MainActivity.this);
    // }
    // };
    // }

    // 极光推送
    @Override
    protected void onPause() {
        super.onPause();
        JPushInterface.onPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        JPushInterface.onResume(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

}
