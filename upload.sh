#
#  Copyright (c) Microsoft. All rights reserved.  
#  Licensed under the MIT license. See LICENSE file in the project root for full license information.
#

echo "vsts-react-native-tasks upload"
echo "Copyright Microsoft Corporation"
echo
echo "This script will acquire and install some dependant node modules. Each package"
echo "is licensed to you by its owner. Microsoft is not responsible for, nor does it" 
echo "grant any licenses to, third-party packages. Some packages may include" 
echo "dependencies which are governed by additional licenses. Follow the package" 
echo "source URL (http://github.com/Microsoft/vsts-react-native-tasks) to determine any" 
echo "dependencies."
echo
read -p "Continue [Y/n]? " yn
if [ -z "$yn" ]; then yn='y'; fi
if [ $yn = 'n' ] || [ $yn = 'N' ]
then
  exit 1
fi

if ! type "npm" > /dev/null; then
  echo Could not find npm. Be sure node.js is installed and both node and npm are in your path.
  exit 1;
fi

if ! type "tfx" > /dev/null; then
  echo Installing tfx-cli...
  npm install -g tfx-cli
  if [ $? -ne 0 ]
  then
    echo "Failed to install tfx-cli."
    exit 1
  fi
  echo Log in to the VSTS/TFS collection you wish to deploy the tasks.
  tfx login --authType basic
  if [ $? -ne 0 ]
  then
    echo "Login failed. Type 'tfx login' to log in and then run this script again."
    exit 1
  fi
fi

echo Installing dependencies...
npm install --only=prod
if [ $? -ne 0 ]
then
  echo "Failed to install dependencies."
  exit 1
fi

node bin/tfxupload.js
if [ $? -ne 0 ]
then
  echo "Upload failed!"
  exit 1
fi
