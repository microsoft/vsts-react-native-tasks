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

// 1. TODO: Check if react native is npm isntalled, if not error saying a npm install task should be added to the build pipeline 
// 2. Setup node
//  -TODO: Linux
// 3. If iOS, fix project
// 4. Call bundle

// ** QUESTION: npm install for user?  Maybe as optional flag?

var buildSourceDirectory = taskLibrary.getVariable('build.sourceDirectory') || taskLibrary.getVariable('build.sourcesDirectory');
//Process working directory
var workingDirectory = taskLibrary.getInput('cwd', /*required*/ false) || buildSourceDirectory;
taskLibrary.cd(workingDirectory);

// Target platform
var platform = taskLibrary.getInput("platform",true);

nodeManager.setupMinNode('4.0.0','4.2.3')
    .then(fixXcproj)
    .then(bundle)
    .fail(function (err) {
        console.error(err.message);
        taskLibrary.debug('taskRunner fail');
        taskLibrary.exit(1);
    });

function fixXcproj()
{
    if(platform == 'ios') {
        // Look through all xpbproj files and add in reference to skip if running in CI env
        var projFiles = glob.sync('ios/*.xcodeproj/project.pbxproj');
        projFiles.forEach(function(proj) {
            taskLibrary.debug('Platform is iOS - attempting to patch ' + proj + ' for CI env.');
            var pbxprojContents = fs.readFileSync(proj, 'utf8');
            var packagerShell = pbxprojContents.match(/".*react-native-xcode.sh.*";/mi);            
            if(packagerShell) {
                packagerShell=packagerShell[0].substring(1, packagerShell[0].length-2);
                if(packagerShell.indexOf('BUILD_IS_FOR_CI+xxx') < 0) {
                    taskLibrary.debug('Patching ' + proj + '.');                            
                    var newShell='if [-z \\"${BUILD_IS_FOR_CI+xxx}\\" ]\\nthen\\n'+ packagerShell + '\\nfi';
                    taskLibrary.debug(newShell);
                    pbxprojContents=pbxprojContents.replace(packagerShell, newShell);           
                    fs.writeFileSync(proj,pbxprojContents,'utf8');                
                } else {
                    taskLibrary.debug(proj + ' already patched.');            
                }
            } else {
                taskLibrary.debug(proj + ' does not require patching.');                            
            }
        });
        // Match react native node module (big hack)
        taskLibrary.debug('Platform is iOS - attempting to patch ' + reactProj + ' for CI env.');
        var reactProj = path.join(workingDirectory,'node_modules','react-native','React','React.xcodeproj','project.pbxproj');
        var pbxprojContents = fs.readFileSync(reactProj, 'utf8');
        var reactPackager = pbxprojContents.match(/".*launchPackager.command.*";/mi);
        if(reactPackager) {
            reactPackager=reactPackager[0].substring(1, reactPackager[0].length-2);
            if(reactPackager.indexOf('BUILD_IS_FOR_CI+xxx') < 0) {
                taskLibrary.debug('Patching ' + reactProj + '.');                            
                var newShell='if [-z \\"${BUILD_IS_FOR_CI+xxx}\\" ]\\nthen\\n'+ reactPackager + '\\nfi';
                taskLibrary.debug(newShell);
                pbxprojContents=pbxprojContents.replace(reactPackager, newShell);           
                fs.writeFileSync(reactProj,pbxprojContents,'utf8');                
            } else {
                taskLibrary.debug(reactProj + ' already patched.');            
            }
        } else {
            taskLibrary.debug(reactProj + ' does not require patching.');                            
        }        
        process.env.BUILD_IS_FOR_CI = "true";
    } else {
        return;     
    }   
}

function bundle()
{
    var entryFile = taskLibrary.getInput("entryFile",true);
    var bundleOutput = taskLibrary.getInput("bundleOutput",true);
    var devFlag = (taskLibrary.getInput('devFlag') == 'true');
    var bundleCommand = new taskLibrary.ToolRunner(taskLibrary.which('node', true));
    bundleCommand.arg([path.join('node_modules','react-native','local-cli','cli.js'), 'bundle', '--platform', platform, '--entry-file', entryFile, '--bundle-output', bundleOutput, '--dev' , devFlag]);

    var transformer = taskLibrary.getInput('transformer',false);
    if(transformer && transformer !== '' && transformer != buildSourceDirectory) {
        bundleCommand.arg(['--transformer', transformer]);        
    }
  
    var sourcemapOutput = taskLibrary.getInput('sourcemapOutput',false);
    if(sourcemapOutput && sourcemapOutput !== '' && sourcemapOutput != buildSourceDirectory) {
        bundleCommand.arg(['--sourcemap-output', sourcemapOutput]);        
    }

    var assetsDest = taskLibrary.getInput('assetsDest',false);
    if(assetsDest && assetsDest !== '' && assetsDest != buildSourceDirectory) {
        bundleCommand.arg(['--assets-dest', assetsDest]);        
    }

    var moreArgs = taskLibrary.getInput('moreArgs',false);
    if(moreArgs && moreArgs !== '') {
        bundleCommand.arg(moreArgs);        
    }
    
    return bundleCommand.exec();
}
