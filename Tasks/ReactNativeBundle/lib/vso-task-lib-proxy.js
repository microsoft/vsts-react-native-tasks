/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

// Monkey patch to get vso-task-lib logging and exit functions to work when calling from PowerShell

var tl;

if(!tl && process.argv.length > 2 && process.argv[2] == '##vso-task-powershell' ) {
	console.log('Script is running from Windows VSO agent.');

	var logDebug = (process.env['SYSTEM_DEBUG'] == 'true');

	// Monkey patch process.stdout before we get to require
	process.stdout._origWrite=process.stdout.write;
	var modWrite = function(chunk, encoding, callback) {
		chunk = chunk + '';  // Make sure it's a string.
		if(chunk.indexOf('##vso[task.debug]') >= 0) {
			if(logDebug) {
				chunk = 'DEBUG: ' + chunk.replace('##vso[task.debug]', '');		
			} else {
				chunk = '';
			}
		}
		this._origWrite(chunk, encoding, callback);
	}
	process.stdout.write=modWrite.bind(process.stdout);

	tl = require('vso-task-lib');

	var warn = console.warn;
	console.warn=function(message) {
		warn('WARN: ' + message);
	}
	tl.warning = console.warn;
	tl.error = console.err;
	tl.exit = process.exit;
} else {
	tl = require('vso-task-lib');
}

module.exports = tl;
