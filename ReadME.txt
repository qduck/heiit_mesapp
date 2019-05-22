
------------------========================================================================1111111111111111 安装错误: Gradle 的编译版本过高, 不兼容部分5.0+手机, 需要降低版本为 1.3.

Installing APK 'app-debug.apk' on 'HUAWEI GRA-TL00 - 5.0.1' for app:debug

Error while uploading app-debug.apk : Unknown failure ([CDS]close[0])

使用AndroidStudio安装的时候，IDE提供了app运行时需要的权限，所以直接使用Debug就可以安装。而使用react-native run-android有这样的问题是因为没有获得权限，所以没法往真机上装应用。

有两种解决办法，一是降低gradle的build版本，改为1.2.3；另一种是升级你的React－Native至最新版本。

打开 React Native 的项目, 修改最外层工程的 build.gradle 配置, 降低 gradle 的 build 为1.2.3版本.

buildscript {

    repositories {

        jcenter()

        mavenLocal()

    }

    dependencies {

        classpath 'com.android.tools.build:gradle:1.2.3' // 修改1.2.3

        classpath 'de.undercouch:gradle-download-task:2.0.0'



        // NOTE: Do not place your application dependencies here; they belong

        // in the individual module build.gradle files

    }

}

这个时候还是会报错，需要重新设置 Gradle 的 Wrapper , 修改为2.2版本.

Gradle version 2.2 is required. Current version is 2.11

修改Gradle的Wrapper版本，需要修改android／griddle／wrapper／grade-wrapper.properties文件:

distributionUrl=https\://services.gradle.org/distributions/gradle-2.2-all.zip

------------------===============================================================================================2222222222222222222222222222

react-native 最新版本爬坑经历(unable to load script from assets 和could not connect to development server.)
2017年12月08日 00:22:54
阅读数：4926
新建项目

react-native init TestApp
1
运行项目

react-native run-android
1
不好意思，错误马上就到了

错误1：unable to load script from assets ‘index.android bundle’ ,make sure your bundle is packaged correctly or youu’re runing a packager server

解决办法 
1，在 android/app/src/main 目录下创建一个 assets空文件夹

mkdir android/app/src/main/assets
1
2，在项目根目录运行

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
1
注意了，是编译index.js而不是index.android.js，因为react-native新版本已经没有index.android.js和index.ios.js两个文件了，只有一个index.js文件,所以要编译index.js 
会发现 assets文件夹下多出两个文件

index.android.bundle      index.android.bundle.meta
1
3，重新react-native run-android


------------------==============================================================================================33333333333333333333333

249
down vote
accepted
I guess it is an error caused by not matching name of project and your registered component.

You have inited project with one name, i.e.

react-native init AwesomeApp

But in your index.ios.js file you register other component

AppRegistry.registerComponent('Bananas', () => Bananas);

When it must be

AppRegistry.registerComponent('AwesomeApp', () => Bananas);

Try to fix it.

-----------------------==================================================44444444444444444444444444444444444444444

npm ERR! Maximum call stack size exceeded
2018年07月10日 21:07:20
阅读数：295
记录自己写react native 所遇到的坑，最近老出问题。也是很难受了。

在自己init新项目后，需要下载一些组件于是报下了以下错误。

E:\Demo>npm install react-native-deprecated-custom-components --save

npm WARN deprecated istanbul-lib-hook@1.2.1: 1.2.0 should have been a major version bump
npm WARN rm not removing E:\Demo\node_modules\.bin\uuid.cmd as it wasn't installed by E:\Demo\node_modules\uuid
npm WARN rm not removing E:\Demo\node_modules\.bin\uuid as it wasn't installed by E:\Demo\node_modules\uuid
npm WARN eslint-plugin-react-native@3.2.1 requires a peer of eslint@^3.17.0 || ^4.0.0 but none is installed. You must install peer dependencies yourself.

npm ERR! Maximum call stack size exceeded

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\hp\AppData\Roaming\npm-cache\_logs\2018-07-10T11_44_08_949Z-debug.log

报错：超过最大调用栈，看得一脸懵逼。最后是通过降级npm解决的，百度说可以npm版本升级降级都可以，但是我升级没有解决问题，降级成功了。

降级：npm install -g npm@5.4.0

升级：npm install -g npm

降级完后下载完我要的插件后，就又开心的启动项目准备写我的项目了。但是它又又又又报错了！

错误类似如下，还好只是个小问题。


E:\Demo>react-native run-android
Command start unrecognized.  Make sure that you have run npm install' and that you are inside a react native project . 
错误提示就是重新npm install一下就好啦。但是！

我又遇到如下错误：（界面不小心关了，这是日志）

4218 verbose argv "C:\\Program Files\\nodejs\\node.exe" "C:\\Users\\hp\\AppData\\Roaming\\npm\\node_modules\\npm\\bin\\npm-cli.js" "install"
4219 verbose node v8.11.3
4220 verbose npm  v5.4.0
4221 error path E:\Demo\node_modules\fsevents\node_modules\ansi-regex\package.json
4222 error code EPERM
4223 error errno -4048
4224 error syscall unlink
4225 error Error: EPERM: operation not permitted, unlink 'E:\Demo\node_modules\fsevents\node_modules\ansi-regex\package.json'
4225 error  { Error: EPERM: operation not permitted, unlink 'E:\Demo\node_modules\fsevents\node_modules\ansi-regex\package.json'
4225 error   stack: 'Error: EPERM: operation not permitted, unlink \'E:\\Demo\\node_modules\\fsevents\\node_modules\\ansi-regex\\package.json\'',
4225 error   errno: -4048,
4225 error   code: 'EPERM',
4225 error   syscall: 'unlink',
4225 error   path: 'E:\\Demo\\node_modules\\fsevents\\node_modules\\ansi-regex\\package.json' }
4226 error Please try running this command again as root/Administrator.

4227 verbose exit [ -4048, true ]

这就非常难受了，在边玩植物大战僵尸边百度的情况下还是找到了解决办法。错误就是需要你升级npm，就是你刚刚降级了npm，现在又要升级回去。

降级：npm install -g npm@5.4.0

升级：npm install -g npm

现在的最新版本是6.1.0（2018-7-10）

我的步骤：

1.进入自己的项目

2.降级npm

3.下载自己需要的插件

4.升级npm

5. npm install

6.react-native run-android

注：都是进入自己的项目里进行的。其中查看npm版本的命令 npm-v,可以升降级后查看是否成功。


-------------QDUCK
//"react-native-camera": "^1.1.4",

code push 地址设置：