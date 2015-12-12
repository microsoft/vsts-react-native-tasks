/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

// TODO:
//  - Linux support
//  - Install and use correct default npm version on Windows (OSX already done)

var	Q = require('q'),
    path = require('path'),
    semver = require('semver'),
    taskLibrary = require('./vso-task-lib-proxy.js'),
    exec = Q.nfbind(require('child_process').exec);

function setupMinNode(minVersion, targetVersion) {
    return exec('node --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.lt(version, minVersion)) {
                taskLibrary.debug('Node < ' + minVersion +', downloading  node ' + targetVersion);
                return setupNode(targetVersion);
            } else {
                taskLibrary.debug('Found node ' + version);
            }
        });
}

function setupMaxNode(maxVersion, targetVersion) {
    return exec('node --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.gt(version, maxVersion)) {
                taskLibrary.debug('Node > ' + maxVersion +', downloading node ' + targetVersion);
                return setupNode(targetVersion);
            } else {
                taskLibrary.debug('Found node ' + version);
            }
        });
}


function setupNode(targetVersion) {
    //TODO: Linux           
    var dlNodeCommand = new taskLibrary.ToolRunner(taskLibrary.which('curl', true));
    if(process.platform == 'darwin') {   
        dlNodeCommand.arg('-o node.tar.gz http://nodejs.org/dist/v'+ targetVersion + '/node-v' + targetVersion +'-darwin-x64.tar.gz');
        return dlNodeCommand.exec()
            .then(function() {
                taskLibrary.debug('Extracting node...');
                var unzipNode = new taskLibrary.ToolRunner(taskLibrary.which('bash', true));
                unzipNode.arg('-c "gunzip -c node.tar.gz | tar xopf -"');
                return unzipNode.exec();                        
            })
            .then(function() {
                // Add node's bin folder to start of path
                process.env.PATH = path.resolve('node-v' + targetVersion + '-darwin-x64/bin') + path.delimiter + process.env.PATH;
            });
    } else {
        taskLibrary.mkdirP('node-win-x86');
        dlNodeCommand.arg('-o node-win-x86\\node.exe https://nodejs.org/dist/v' + targetVersion + '/win-x86/node.exe -o node-win-x86\\node.lib https://nodejs.org/dist/v' + targetVersion + '/win-x86/node.lib');
        return dlNodeCommand.exec()
            .then(function() {
                // Add node's bin folder to start of path
                process.env.PATH = path.resolve('node-win-x86') + path.delimiter + process.env.PATH;
            });
    }
}

function removeExecOutputNoise(input) {
	var output = input + '';	
	return output.trim().replace(/[",\n\r\f\v]/gm,'');
}

module.exports = {
	setupNode: setupNode,
    setupMaxNode: setupMaxNode,
    setupMinNode: setupMinNode
}