package com.xioliftmes;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import org.reactnative.camera.RNCameraPackage;
import com.rnfs.RNFSPackage;
import com.microsoft.codepush.react.CodePush;
import com.horcrux.svg.SvgPackage;
import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.rssignaturecapture.RSSignatureCapturePackage;
import com.imagepicker.ImagePickerPackage;
import community.revteltech.nfc.NfcManagerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;
import org.pgsqlite.SQLitePluginPackage;

public class MainApplication extends Application implements ReactApplication {

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
          new ReactNativeConfigPackage(), new RNCameraPackage(), new RNFSPackage(),
          new CodePush(BuildConfig.Code_Push_deploymentKey, getApplicationContext(),
              BuildConfig.DEBUG, BuildConfig.Code_Push_Server),
          new SvgPackage(), new BackgroundJobPackage(), new RSSignatureCapturePackage(), new ImagePickerPackage(),
          new NfcManagerPackage(), new VectorIconsPackage());
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

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
