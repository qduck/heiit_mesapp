package com.xioliftmes;

import android.app.Application;
import android.support.multidex.MultiDex;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;

import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import org.reactnative.camera.RNCameraPackage;
import com.rnfs.RNFSPackage;
import com.microsoft.codepush.react.CodePush;
import com.horcrux.svg.SvgPackage;
import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.rssignaturecapture.RSSignatureCapturePackage;
import com.imagepicker.ImagePickerPackage;
import community.revteltech.nfc.NfcManagerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import cn.jpush.reactnativejpush.JPushPackage;//极光推送
import java.util.Arrays;
import java.util.List;
import org.pgsqlite.SQLitePluginPackage;

public class MainApplication extends Application implements ReactApplication {
  private boolean SHUTDOWN_TOAST = true;// 极光推送关闭初始化成功的toast框
  private boolean SHUTDOWN_LOG = false;// 极光推送

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new SQLitePluginPackage(), new MainReactPackage(),
            new RNCWebViewPackage(), new RNSoundPackage(),
          new ReactNativeAudioPackage(), new JPushPackage(SHUTDOWN_TOAST, SHUTDOWN_LOG), new PickerPackage(),
          new ReactNativeConfigPackage(), new RNCameraPackage(), new RNFSPackage(),
          new CodePush(BuildConfig.Code_Push_deploymentKey, getApplicationContext(), BuildConfig.DEBUG,
              BuildConfig.Code_Push_Server),
          new SvgPackage(), new BackgroundJobPackage(), new RSSignatureCapturePackage(), new ImagePickerPackage(),
          new NfcManagerPackage(), new VectorIconsPackage(), new BaiduTtsReactNativePackage(), new KeyboardPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  // @Override
  // public void attachBaseContext() {
  // MultiDex.install(this);
  // }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // 调用此方法：点击通知让应用从后台切到前台
    // JPushModule.registerActivityLifecycle(this);
  }

}
