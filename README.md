<table style="width: 100%; border-style: none;"><tr>
<td style="width: 140px; text-align: center;"><img src="docs/media/misc/cordova_logo_white_purple.png" /></td>
<td><strong>Visual Studio Team Services Extension for React Native</strong><br />
<i>Streamline CI setup for your React Native app using a set of useful pre-defined build steps.</i><br />
<a href="http://www.microsoft.com">Install now!</a>
</td>
</tr></table>
# Visual Studio Team Services Extension for React Native

WORDS GO HERE
	
## Quick Start

1. After installing the extension, upload your project to VSTS, TFS, or GitHub.

2. Go to your Visual Studio Online or TFS project, click on the **Build** tab, and create a new build definition (the "+" icon).

3. Click **Add build step...** and select **npm** from the **Package** category

3. Click **Add build step...** and select **React Native Bundle** from the **Build** category

3. Click **Add build step...** and select **Xcode Build** from the **Build** category

4. Configure the three build steps - *Check out the tool tips for handy inline documentation.*

## Usage and Tutorials

WORDS GO HERE

##Installation

### Visual Studio Team Services / Visual Studio Online
1. Install the [Visual Studio Team Services Extension for React Native](http://www.microsoft.com)

2. You will now find the React Native Bundle task in the "Build" category 

### TFS 2015 Update 1 or Earlier

1. [Enable basic auth](http://go.microsoft.com/fwlink/?LinkID=699518) in your TFS instance

2. Install the tfx-cli and login

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	npm install -g tfx-cli
	tfx login --authType basic 
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

3. Enter your collection URL (Ex: https://localhost:8080/tfs/DefaultCollection) and user name and password 

4. Download the [latest release](http://go.microsoft.com/fwlink/?LinkID=691191) of the Cordova tasks locally and unzip

5. Type the following from the root of the repo from Windows:

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	upload
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	Or from a Mac:

	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	sh upload.sh
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

5. Profit!

## Contact Us

WORDS GO HERE

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
