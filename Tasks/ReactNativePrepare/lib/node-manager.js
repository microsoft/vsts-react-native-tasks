/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

// TODO:
//  - Install and use correct default npm version on Windows (OSX already done)
//  - Download w/o curl on Windows

var	Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    semver = require('semver'),
    taskLibrary = require('./vso-task-lib-proxy.js'),
    exec = Q.nfbind(require('child_process').exec);

var NODE_VERSION_CACHE = process.env['NODE_VERSION_CACHE'] || process.platform == 'win32' ? path.join(process.env['APPDATA'], 'node_version_cache') : path.join(process.env['HOME'], '.node_version_cache')
var nodePath;

function setupMinNode(minVersion, targetVersion) {
    var nodeCli = taskLibrary.which('node');
    return exec('"' + nodeCli + '" --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.lt(version, minVersion)) {
                taskLibrary.debug('Node < ' + minVersion +', downloading node ' + targetVersion);
                return setupNode(targetVersion);
            } else {
                taskLibrary.debug('Found node ' + version);
                nodePath = path.dirname(nodeCli);
            }
        });
}

function setupMaxNode(maxVersion, targetVersion) {
    var nodeCli = taskLibrary.which('node');
    return exec('"' + nodeCli + '" --version')
        .then(function(version) {
            version = removeExecOutputNoise(version);
            if(semver.gt(version, maxVersion)) {
                taskLibrary.debug('Node > ' + maxVersion +', downloading node ' + targetVersion);
                return setupNode(targetVersion);
            } else {
                taskLibrary.debug('Found node ' + version);
                nodePath = path.dirname(nodeCli);
            }
        });
}


function setupNode(targetVersion) {
    if(!fs.existsSync(NODE_VERSION_CACHE)) {
        taskLibrary.mkdirP(NODE_VERSION_CACHE);
    }
    var dlNodeCommand = new taskLibrary.ToolRunner(taskLibrary.which('curl', true));
    if(process.platform == 'win32') {
        nodePath = path.join(NODE_VERSION_CACHE, 'node-win-x86-' + targetVersion);
        process.env.PATH = nodePath + path.delimiter + process.env.PATH;
        // Download node version if not found     
        if(!fs.existsSync(nodePath)) {
            taskLibrary.mkdirP(nodePath);
            dlNodeCommand.arg('-o "' + path.join(nodePath, 'node.exe') + '" https://nodejs.org/dist/v' + targetVersion + '/win-x86/node.exe');
            // TODO: Download correct npm version and place npm.cmd in same folder
            //       Simple approach could be to simply grab the latest npm 2.x.x when Node < 5.0.0 and npm 3.x.x when 5.0.0 or up
            return dlNodeCommand.exec();
        } else {
            return Q();
        }
    } else {   
        var folderName = process.platform == 'darwin' ? ('node-v' + targetVersion + '-darwin-x64') : ('node-v' + targetVersion + '-linux-x86');
        taskLibrary.debug('Node target: ' + folderName)
        nodePath = path.join(NODE_VERSION_CACHE, folderName, 'bin');
        process.env.PATH = nodePath + path.delimiter + process.env.PATH;   
        // Download node version if not found     
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