#
#  Copyright (c) Microsoft. All rights reserved.  
#  Licensed under the MIT license. See LICENSE file in the project root for full license information.
#

param (
    [string]$platform,
    [string]$entryFile,
    [string]$bundleOutput,
    [string]$devFlag,
    [string]$sourcemapOutput
    [string]$assetsDest
    [string]$transformer
    [string]$moreArgs
    [string]$cwd
) 

import-module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Common"
 
$debug=Get-TaskVariable -Context $distributedTaskContext -Name "System.Debug"
 
# Set env vars as expected by node script
$Env:INPUT_PLATFORM = $platform
$Env:INPUT_ENTRYFILE = $entryFile
$Env:INPUT_BUNDLEOUTPUT = $bundleOutput
$Env:INPUT_DEVFLAG = $devFlag
$Env:INPUT_SOURCEMAPOUTPUT = $sourcemapOutput
$Env:INPUT_ASSETDEST = $assetsDest
$Env:INPUT_TRANSFORMER = $transformer
$Env:INPUT_MOREARGS = $moreArgs
$Env:INPUT_CWD = $cwd
$Env:SYSTEM_DEBUG = $debug

# Node has an annoying habit of outputting warnings to standard error, so redirect stderr to stdout and call script
$node = Get-Command -Name node -ErrorAction Ignore
if(!$node)
{
    throw (Get-LocalizedString -Key "Unable to locate {0}" -ArgumentList 'node')
}

#cordova Script is in same spot as this powershell script
$scriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Invoke-Tool -Path $node.Path -Arguments "react-native-bundle.js ##vso-task-powershell" -WorkingFolder $scriptRoot