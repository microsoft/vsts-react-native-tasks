/*
  Copyright (c) Microsoft. All rights reserved.
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

var path = require('path'),
    fs = require('fs'),
    glob = require('glob'),
	Q = require ('q'),
    nodeManager = require('./lib/node-manager.js'),
    taskLibrary = require('./lib/vso-task-lib-proxy.js');

// Task does the following:
// 1. Setup node
// 2. If iOS, fix project and call bundle directly
// 3. If Android, update react-native CLI calls in react.gradle to use node version

var buildSourceDirectory = taskLibrary.getVariable('build.sourceDirectory') || taskLibrary.getVariable('build.sourcesDirectory');
//Process working directory
var workingDirectory = taskLibrary.getInput('cwd', /*required*/ false) || buildSourceDirectory;
taskLibrary.cd(workingDirectory);
// Target platform
var platform = taskLibrary.getInput("platform", true);

var nodeModulesPath = path.join(workingDirectory, 'node_modules');
if (!fs.existsSync(path.join(nodeModulesPath, 'react-native'))) {
    taskLibrary.debug('react-native npm package not installed in ' + nodeModulesPath);
    var errMessage = 'React Native npm package (react-native) not installed locally. Add the "npm" task to your build definition with the "install" command and "--no-optional --only=prod" under Advanced > Arguments.  Also ensure Advanced > Working Directory is set in the React Native Bundle task if your React Native project is not off the root directory.';
    taskLibrary.setResult(1, errMessage);
} else {
    nodeManager.setupMinNode('4.0.0','4.2.3', false)
        .then(bundle)
        .then(function() {
            console.log('Success: React Native bundled.')
        })
        .fail(function (err) {
            taskLibrary.setResult(1, err.message);
        });
}

function bundle() {
    var entryFile = taskLibrary.getInput("entryFile", true);
    var bundleOutput = taskLibrary.getInput("bundleOutput", true);
    var devFlag = (taskLibrary.getInput('devFlag') == 'true');
    var bundleCommand = new taskLibrary.ToolRunner(taskLibrary.which('node', true));
    bundleCommand.arg([path.join('node_modules','react-native','local-cli','cli.js'), 'bundle', '--platform', platform, '--entry-file', entryFile, '--bundle-output', bundleOutput, '--dev' , devFlag]);

    var transformer = taskLibrary.getInput('transformer', false);
    if (transformer && transformer !== '' && transformer != buildSourceDirectory) {
        bundleCommand.arg(['--transformer', transformer]);
    }

    var sourcemapOutput = taskLibrary.getInput('sourcemapOutput', false);
    if (sourcemapOutput && sourcemapOutput !== '' && sourcemapOutput != buildSourceDirectory) {
        bundleCommand.arg(['--sourcemap-output', sourcemapOutput]);
    }

    var assetsDest = taskLibrary.getInput('assetsDest', false);
    if (assetsDest && assetsDest !== '' && assetsDest != buildSourceDirectory) {
        if (!fs.existsSync(assetsDest)) {
            var xcassetDirs = glob.sync(assetsDest);
            if (xcassetDirs && xcassetDirs.length >0 ) {
                assetsDest = xcassetDirs[0];
            }
        }
        bundleCommand.arg(['--assets-dest', assetsDest]);
    }

    var moreArgs = taskLibrary.getInput('moreArgs', false);
    if (moreArgs && moreArgs !== '') {
        bundleCommand.arg(moreArgs);
    }

    return bundleCommand.exec();
}
