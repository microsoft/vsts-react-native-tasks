**This extension targets a platform (React Native) that is rapidly evolving and therefore this extension is currently in early preview. It has been designed for use with React Native _0.19.0_ and above.** Earlier versions of React Native are missing out-of-box support for selecting non-global versions of Node.js for iOS and therefore may not function as expected and may still result in a hung build for iOS.

[React Native](http://facebook.github.io/react-native/) is an exciting new technology that allows you to bring awesome native app experiences to Android and iOS using a consistent developer experience based on JavaScript and React. Visual Studio Team Services (formerly Visual Studio Online) and Team Foundation Services (TFS) 2015 can be used for building and testing React Native apps in a Continuous Integration (CI) environment thanks to a new [cross-platform agent](http://go.microsoft.com/fwlink/?LinkID=533789) that supports OSX. When you are developing your React Native app you'll be able to take advantage of the React Native packager but in a CI environment or for actual app deployments you'll want to create an offline "bundle" that present a few challenges that need to be resolved.

# Visual Studio Team Services Extension for React Native (Preview)
This extension provides a "React Native Prepare" task to simplify setup and deal with two specific problems: 

1. Node.js version headaches - The task will fetch and configure the build to use a compatible version of Node.js if not found globally installed.
2. Preventing the "Packager" from starting up as a server and hanging and/or failing your native Xcode build for iOS.

Combined with a "Bundle" task it should provide you with all the tools you need to get your React Native App up and running in a CI environment.

![React Native Prepare](docs/media/screen.png)

## Quick Start

1. After installing the extension, upload your project to VSTS, TFS, or GitHub.

2. Go to your VSTS or TFS project, click on the **Build** tab, and create a new build definition (the "+" icon). You can use the Empty template.

3. Click **Add build step...** and add the following to your build definition:
   
   1. Add **npm** from the **Package** category. Specify **install** as the Command, **--no-optional --only=prod** under Advanced &gt; Arguments to speed up the build, and set **Advanced &gt; Working Directory** if your React Native project structure is not in the repository root. You may need to add **--force** if you encounter EPERM issues due to a [npm bug](https://github.com/npm/npm/issues/9696). 

   2. Add **React Native Prepare** from the **Build** category and select the appropriate platform. Set **Working Directory** and the **Xcode Project(s)** or **react.gradle Path** option if your React Native project structure is not in the repisotry root.
  
   3. Add **Xcode Build** for iOS or **Gradle** for Android from the **Build** category and configure your native build. *Check out the tool tips for handy inline documentation.*

4. **[Optional]** While typically not required for React Native 0.19.0 and up, you can also add the **React Native Bundle** task from the **Build** category to create your offline bundle if you've modified the default generated projects.

In addition, be sure you are running version **0.3.10** or higher of the cross-platform agent and the latest Windows agent as these are required for VS Team Services extension to function. The VSTS hosted agent and [MacinCloud](http://go.microsoft.com/fwlink/?LinkID=691834) agents will already be on this version.

**Windows Agent Notes:** 
- **curl** also needs to be in the path on Windows if Node.js < 4.0.0 is globally installed. You can get curl by installing the [Git Command Line Tools](http://www.git-scm.com/downloads).

##Additional Details
###React Native Prepare Task
The React Native Prepare task has two primary functions. *Note that if you are running into problems and have deviated from the default project provided by React Native init using 0.19.0 or above you may need to make some tweaks.* The task is designed to do the following:

1. Acquire and setup the appropriate version of Node.js for use in the build. This is particularly useful in environments you may not control. 
2. Disable the React Native Packager from starting as a server when building iOS as this provides no value in a CI workflow and will hang the agent and can result in port conflict issues failing the build.

Under the hood, here is what is happening:

1. **Android:** It modifies **react.gradle** to call node node_modules/react-native/local-cli/cli.js using the correct version of Node.js instead of just blindly calling "react-native bundle". This solves both the node version problem and avoids having to have react-native-cli installed globally.
2. **iOS:** For iOS, two changes were required:
    1. It modifies the **Bundle React Native code and images** Build Phase in your Xcode project ensure **export NODE_BINARY** is set to the correct path for Node.js before calling ../node_modules/react-native/packager/react-native-xcode.sh. If the export is missing it is added.
    2. It disables the startup of the **React Native Packager** as a local server in the Build Phases of **node_modules/react-native/React.xcodeproj** by modifying the embedded shell script to exit as this provides no value in a CI workflow and will hang the agent.

###React Native Bundle Task
This task is a thin UI layer on top of the standard React Native bundle command from the React Native CLI. It is provided as a convenience  mechanism and is not required when using stock projects for 0.19.0 and up as the provided Gradle build and Xcode projects trigger bundling when doing a release build by default.

## Installation for TFS 2015 Update 1 or Earlier

See the [source code repository](https://github.com/Microsoft/vsts-react-native-tasks) for instructions on installing these tasks on TFS 2015 Update 1 or earlier.

## Contact Us
* [File an issue on GitHub](https://github.com/Microsoft/vsts-react-native-tasks/issues)
* [View or contribute to the source code](https://github.com/Microsoft/vsts-react-native-tasks)

