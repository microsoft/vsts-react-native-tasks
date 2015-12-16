/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

// TODO:
//  - Install and use correct default npm version on Windows for realzies - Right now just does latest node 2 for < 5.0.0 and 3 otherwise
//  - Download w/o curl on Windows

var	Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    semver = require('semver'),
    taskLibrary = require('./vso-task-lib-proxy.js'),
    exec = Q.nfbind(require('child_process').exec);

var NODE_VERSION_CACHE = process.env['NODE_VERSION_CACHE'] || process.platform == 'win32' ? path.join(process.env['APPDATA'], 'node-version-cache') : path.join(process.env['HOME'], '.node-version-cache')
var nodePath;

function setupMinNode(minVersion, targetVersion, /*optional*/ installNpmOnWindows) {
    var nodeCli = taskLibrary.which('node');
    return exec('"' + nodeCli + '" --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.lt(version, minVersion)) {
                taskLibrary.debug('Node < ' + minVersion +', downloading node ' + targetVersion);
                return setupNode(targetVersion, installNpmOnWindows);
            } else {
                taskLibrary.debug('Found node ' + version);
                nodePath = path.dirname(nodeCli);
            }
        });
}

function setupMaxNode(maxVersion, targetVersion, /*optional*/ installNpmOnWindows) {
    var nodeCli = taskLibrary.which('node');
    return exec('"' + nodeCli + '" --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.gt(version, maxVersion)) {
                taskLibrary.debug('Node > ' + maxVersion +', downloading node ' + targetVersion);
                return setupNode(targetVersion, installNpmOnWindows);
            } else {
                taskLibrary.debug('Found node ' + version);
                nodePath = path.dirname(nodeCli);
            }
        });
}

function setupNode(targetVersion, /*optional*/ installNpmOnWindows) {
    if(!fs.existsSync(NODE_VERSION_CACHE)) {
        taskLibrary.mkdirP(NODE_VERSION_CACHE);
    }
    var dlNodeCommand = new taskLibrary.ToolRunner(taskLibrary.which('curl', true));
    if(process.platform == 'win32') {
        var promise;
        nodePath = path.join(NODE_VERSION_CACHE, 'node-win-x86-' + targetVersion);
        process.env.PATH = nodePath + path.delimiter + process.env.PATH;
        process.env.PATH = path.join(nodePath, 'node_modules', '.bin') + path.delimiter + process.env.PATH;  // If npm happens to be installed - does no harm if not
        // Download node version if not found     
        if(!fs.existsSync(nodePath)) {
            taskLibrary.mkdirP(nodePath);
            dlNodeCommand.arg('-o "' + path.join(nodePath, 'node.exe') + '" https://nodejs.org/dist/v' + targetVersion + '/win-x86/node.exe');
            promise = dlNodeCommand.exec();
        } else {
            promise = Q();
        }

        // TODO: If "installNpmOnWindows" set, download correct npm version and add node_modules/.bin into path. 
        //       There does not appear to be a great way to do this w/o the Windows MSI
        //       Right now it simply grabs the latest npm 2.x.x when Node target is < 5.0.0 and npm 3.x.x when 5.0.0 or up.
        //       Uses whatever npm version is found to install npm locally.        
        if(typeof(installNpmOnWindows) === 'undefined') {
            installNpmOnWindows = true;
        }
        if(installNpmOnWindows && !fs.existsSync(path.join(nodePath,'node_modules','npm'))) {
            // Use cmd to temporarly switch to cache drive letter and path and do npm install npm
            var npmInstallCmd = new taskLibrary.ToolRunner(taskLibrary.which('cmd', true));
            var npmVersion = semver.lt(targetVersion, '5.0.0') ? '^2.11.3' : '^3.5.2';
            npmInstallCmd.arg('/c cd ' + nodePath.substr(0,2) + ' && cd "' + nodePath + '" && npm install npm@' + npmVersion);
            promise = promise.then(npmInstallCmd.exec());
        }
        return promise;
    } else {   
        var folderName = process.platform == 'darwin' ? ('node-v' + targetVersion + '-darwin-x64') : ('node-v' + targetVersion + '-linux-x86');
        taskLibrary.debug('Node target: ' + folderName)
        nodePath = path.join(NODE_VERSION_CACHE, folderName, 'bin');
        process.env.PATH = nodePath + path.delimiter + process.env.PATH;   
        // Download node version if not found - npm also grabbed, installed, and used     
        if(!fs.existsSync(nodePath)) {
            var gzPath =  path.join(NODE_VERSION_CACHE, folderName + '.tar.gz');
            taskLibrary.debug('Downloading ' + gzPath)
            dlNodeCommand.arg('-o "' + gzPath + '" http://nodejs.org/dist/v'+ targetVersion + '/' + folderName + '.tar.gz');
            return dlNodeCommand.exec()
                .then(function() {
                    taskLibrary.debug('Extracting ' + gzPath);
                    var unzipNode = new taskLibrary.ToolRunner(taskLibrary.which('bash', true));
                    unzipNode.arg('-c "cd ' + NODE_VERSION_CACHE.replace(' ','\\ ') + '; gunzip -c ' + folderName + '.tar.gz | tar xopf -"');
                    return unzipNode.exec();                        
                })
        }
    }
}

function removeExecOutputNoise(input) {
	var output = input + '';	
	return output.trim().replace(/[",\n\r\f\v]/gm,'');
}

module.exports = {
	setupNode: setupNode,
    setupMaxNode: setupMaxNode,
    setupMinNode: setupMinNode,
    getNodePath: function() {
        return nodePath;
    }
}