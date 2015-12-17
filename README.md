<table style="width: 100%; border-style: none;"><tr>
<td style="width: 140px; text-align: center;"><img src="docs/media/logo.png" /></td>
<td><strong>Visual Studio Team Services Extension for React Native</strong><br />
<i>Streamline CI setup for your React Native app using a set of useful pre-defined build steps.</i><br />
<a href="http://www.microsoft.com">Install now!</a>
</td>
</tr></table>
# Visual Studio Team Services Extension for React Native
**This extension targets a platform (React Native) that is rapidly evolving. The extension is therefore in early preview and has been tested for use with React Native 0.16.0 and 0.17.0.**

[React Native](http://facebook.github.io/react-native/) is an exciting new technology that allows you to bring awesome native app experiences to Android and iOS using a consistent developer experience based on JavaScript and React. Visual Studio Team Services (formerly Visual Studio Online) and Team Foundation Services (TFS) 2015 can be used for building and testing React Native apps in a Continuous Integration (CI) environment thanks to a new [cross-platform agent](http://go.microsoft.com/fwlink/?LinkID=533789) that supports OSX. 

When you are developing your React Native app you'll be able to take advantage of the React Native packager but in a CI environment or for actual app deployments you'll want to create an offline "bundle" and there are a few chanllenges that need to be resolved.

This extension provides a "React Native Prepare" task to simplify setup and deal with two specific problems: 

1. Node.js version headaches - The task will fetch and alter projects to use a compatible version of Node.js if not found globally installed.
2. Preventing the "Packager" from starting up as a server and hanging your native Xcode build for iOS and instead explicitly "bundling" prior to the build.

Also be sure to check out the super cool continous delivery features in the [**CodePush VSTS extension**](https://marketplace.visualstudio.com/items/ms-vsclient.code-push) which also supports React Native!

![React Native Prepare](docs/media/screen.png)

## Quick Start

1. After installing the extension, upload your project to VSTS, TFS, or GitHub.

2. Go to your VSTS or TFS project, click on the **Build** tab, and create a new build definition (the "+" icon).

3. Click **Add build step...** and select **npm** from the **Package** category. Specify **--no-optional --only=prod** under Advanced > Arguments to speed up the build. You may need to add **--force** if you encounter EPERM issues in the Hosted VSTS agent due to a [npm issue](https://github.com/npm/npm/issues/9696).

4. Click **Add build step...** and select **React Native Prepare** from the **Build** category

5. Click **Add build step...** and select **Xcode Build** or **Android Build** from the **Build** category

6. Configure the three build steps - *Check out the tool tips for handy inline documentation.**

In addition, be sure you are running version **0.3.10** or higher of the cross-platform agent and the latest Windows agent as these are required for VS Team Services extension to function. The VSTS hosted agent and [MacinCloud](http://go.microsoft.com/fwlink/?LinkID=691834) agents will already be on this version.

**Windows Agent Notes:** 
- **curl** also needs to be in the path on Windows. You can get curl by installing the [Git Command Line Tools](http://www.git-scm.com/downloads).
- Due to an issue with Ract Native you will need to use **react-native 0.17.0-rc** or higher when building on Windows. 

##Installation

### Visual Studio Team Services / Visual Studio Online
1. Install the [Visual Studio Team Services Extension for React Native](http://www.microsoft.com)

2. You will now find the React Native Prepare task in the "Build" category 

### TFS 2015 Update 1 or Earlier

1. [Enable basic auth](http://go.microsoft.com/fwlink/?LinkID=699518) in your TFS instance

2. Install the tfx-cli and login. If you already have the tfx-cli installed, be sure it is **0.3.6 or higher.**

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	npm install -g tfx-cli
	tfx login --auth-type basic 
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

3. Enter your collection URL (Ex: https://localhost:8080/tfs/DefaultCollection) and user name and password. Do not include a slash (/) at the end of the collection URL.

4. Download the [latest release](https://github.com/Microsoft/vsts-react-native-tasks/releases) of the React Native tasks locally and unzip

5. Type the following from the root of the repo from Windows:

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	upload
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	Or from a Mac:

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	sh upload.sh
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

5. Profit!

## Terms of Use
By downloading and running this project, you agree to the license terms of the third party application software, Microsoft products, and components to be installed. 

The third party software and products are provided to you by third parties. You are responsible for reading and accepting the relevant license terms for all software that will be installed. Microsoft grants you no rights to third party software.

## License

```
The MIT License (MIT)

Copyright (c) Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
