**This extension targets a platform (React Native) that is rapidly evolving. The extension is therefore in early preview and has been tested for use with React Native 0.16.0 and 0.17.0.**

[React Native](http://facebook.github.io/react-native/) is an exciting new technology that allows you to bring awesome native app experiences to Android and iOS using a consistent developer experience based on JavaScript and React. Visual Studio Team Services (formerly Visual Studio Online) and Team Foundation Services (TFS) 2015 can be used for building and testing React Native apps in a Continuous Integration (CI) environment thanks to a new [cross-platform agent](http://go.microsoft.com/fwlink/?LinkID=533789) that supports OSX. 

# Visual Studio Team Services Extension for React Native
When you are developing your React Native app you'll be able to take advantage of the React Native packager but in a CI environment or for actual app deployments you'll want to create an offline "bundle" and there are a few chanllenges that need to be resolved.

This extension provides a "React Native Prepare" task to simplify setup and deal with two specific problems: 

1. Node.js version headaches - The task will fetch and alter projects to use a compatible version of Node.js if not found globally installed.
2. Preventing the "Packager" from starting up as a server and hanging your native Xcode build for iOS and instead explicitly "bundling" prior to the build.

Also be sure to check out the super cool continous delivery features in the [**CodePush VSTS extension**](https://marketplace.visualstudio.com/items/ms-vsclient.code-push) which also supports React Native!

![React Native Prepare](media/screen.png)

## Quick Start

1. After installing the extension, upload your project to VSTS, TFS, or GitHub.

2. Go to your VSTS or TFS project, click on the **Build** tab, and create a new build definition (the "+" icon).

3. Click **Add build step...** and select **npm** from the **Package** category. Specify **--no-optional --only=prod** under Advanced > Arguments to speed up the build. You may need to add **--force** if you encounter EPERM issues in the Hosted VSTS agent due to a [npm issue](https://github.com/npm/npm/issues/9696).

4. Click **Add build step...** and select **React Native Prepare** from the **Build** category

5. Click **Add build step...** and select **Xcode Build** or **Android Build** from the **Build** category

6. Configure the three build steps - *Check out the tool tips for handy inline documentation.*

In addition, be sure you are running version **0.3.10** or higher of the cross-platform agent and the latest Windows agent as these are required for VS Team Services extension to function. The VSTS hosted agent and [MacinCloud](http://go.microsoft.com/fwlink/?LinkID=691834) agents will already be on this version.

**Windows Agent Notes:** 
- **curl** also needs to be in the path on Windows. You can get curl by installing the [Git Command Line Tools](http://www.git-scm.com/downloads).
- Due to an issue with Ract Native you will need to use **react-native 0.17.0-rc** or higher when building on Windows. 

## Installation for TFS 2015 Update 1 or Earlier

See the [source code repository](https://github.com/Microsoft/vsts-react-native-tasks) for instructions on installing these tasks on TFS 2015 Update 1 or earlier.

## Contact Us
* [File an issue on GitHub](https://github.com/Microsoft/vsts-react-native-tasks/issues)
* [View or contribute to the source code](https://github.com/Microsoft/vsts-react-native-tasks)

