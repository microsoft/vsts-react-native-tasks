<table style="width: 100%; border-style: none;"><tr>
<td style="width: 140px; text-align: center;"><img src="docs/media/logo.png" /></td>
<td><strong>Visual Studio Team Services Extension for React Native</strong><br />
<i>Streamline CI setup for your React Native app using a set of useful pre-defined build steps.</i><br />
<a href="http://www.microsoft.com">Install now!</a>
</td>
</tr></table>
# Visual Studio Team Services Extension for React Native
[React Native](http://facebook.github.io/react-native/) is an exciting new technology that allows you to bring awesome native app experiences to Android and iOS using a consistent developer experience based on JavaScript and React. Visual Studio Team Services (formerly Visual Studio Online) and Team Foundation Services (TFS) 2015 can be used for building and testing React Native apps in a Continuous Integration (CI) environment thanks to a new [cross-platform agent](http://go.microsoft.com/fwlink/?LinkID=533789) that supports OSX. 

When you are developing your React Native app you'll be able to take advantage of the React Native packager but in a CI environment or for actual app deployments you'll want to create an offline "bundle".

This extension provides a "React Native Bundle" task to simplify setup and deal with two specific problems: 
1. Node.js version headaches - The task will fetch a compatible version of Node.js if not in use
2. Preventing the "Packager" from starting up as a daemon process and hanging your CI build.

## Quick Start

1. After installing the extension, upload your project to VSTS, TFS, or GitHub.

2. Go to your Visual Studio Online or TFS project, click on the **Build** tab, and create a new build definition (the "+" icon).

3. Click **Add build step...** and select **npm** from the **Package** category

3. Click **Add build step...** and select **React Native Bundle** from the **Build** category

3. Click **Add build step...** and select **Xcode Build** or **Android Build** from the **Build** category

4. Configure the three build steps - *Check out the tool tips for handy inline documentation.*

*Note: Be sure you are running version 0.3.10 or higher of the cross-platform agent and the latest Windows agent as these are required for VS Team Services extension to function. The VSTS hosted agent and [MacinCloud](http://go.microsoft.com/fwlink/?LinkID=691834) agents will already be on this version.*

##Installation

### Visual Studio Team Services / Visual Studio Online
1. Install the [Visual Studio Team Services Extension for React Native](http://www.microsoft.com)

2. You will now find the React Native Bundle task in the "Build" category 

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
