@ECHO OFF
REM
REM  Copyright (c) Microsoft. All rights reserved.  
REM  Licensed under the MIT license. See LICENSE file in the project root for full license information.
REM
ECHO vsts-react-native-tasks upload
ECHO Copyright Microsoft Corporation
ECHO.
ECHO This script will acquire and install some dependant node modules. Each package 
ECHO is licensed to you by its owner. Microsoft is not responsible for, nor does it 
ECHO grant any licenses to, third-party packages. Some packages may include 
ECHO dependencies which are governed by additional licenses. Follow the package 
ECHO source URL (http://github.com/Microsoft/vsts-react-native-tasks) to determine any 
ECHO dependencies.
ECHO.
SET /p YN="Continue [Y/n]? "
IF /I '%YN%'=='n' EXIT /B 1
ECHO.

CALL npm --version 1>NUL 2>NUL
IF NOT %ERRORLEVEL%==0 GOTO INSTALLFAILED

CALL tfx version 1>NUL 2>NUL
IF NOT %ERRORLEVEL%==0 GOTO TFXINSTALL

:NPMINSTALL
ECHO Installing dependencies...
CALL npm install --only=prod
IF NOT %ERRORLEVEL%==0 GOTO INSTALLFAILED

:EXEC
CALL node bin/tfxupload.js
IF NOT %ERRORLEVEL%==0 GOTO UPLOADFAILED
EXIT /B 0

:TFXINSTALL
ECHO Installing tfx-cli...
CALL npm install -g tfx-cli
IF NOT %ERRORLEVEL%==0 GOTO INSTALLFAILED
ECHO Log in to the VSO/TFS collection you wish to deploy the tasks.
CALL tfx login --authType basic
IF NOT %ERRORLEVEL%==0 GOTO LOGINFAILED
GOTO NPMINSTALL

:UPLOADFAILED
ECHO Failed to upload! Ensure Node.js is installed and in your path and you are logged into a VSTS/TFS collection where you have build administration privileges.
EXIT /B %ERRORLEVEL%

:INSTALLFAILED
ECHO Failed to install npm packages. Ensure Node.js is installed and node and npm are in your path.
EXIT /B %ERRORLEVEL%

:LOGINFAILED
ECHO Login failed. Type "tfx login" to log in and then re-run this script.
EXIT /B %ERRORLEVEL%

