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
    var errMessage = 'React Native npm package (react-native) not installed locally. Add the "npm" task to your build definition with the "install" command and "--no-optional --only=prod" under Advanced > Arguments.  Also ensure Advanced > Working Directory is set in the React Native Prepare task if your React Native project is not off the root directory.';
    taskLibrary.setResult(1, errMessage);
} else {
    nodeManager.setupMinNode('4.0.0','4.2.3', false)
        .then(fixProjects)
        .then(function() {
            console.log('Success: Project ready for native build.')
        })
        .fail(function (err) {
            taskLibrary.setResult(1, err.message);
        });
}

function fixProjects() {
    if (platform == 'ios') {
        // Fix project and call bundle
        return fixXcproj();
    } else if (platform == 'android') {
        // No need to call bundle for Android but need to tweak the project a bit
        return fixGradleProj();
    } else {
        throw 'Platform ' + platform + 'not supported.';
    }
}

function fixXcproj() {
    var xcodeProject = taskLibrary.getInput('xcodeProject', true);

    if (! xcodeProject || xcodeProject === '' || xcodeProject === buildSourceDirectory) {
        taskLibrary.debug("No Xcode project set, so the project won't be patched");
    }
    else {
        // The default behavior of React Native iOS is to start up the packager server on build.  The problem with this
        // behavior is that it is not only unncessisary but also will _hang_ VSTS since it will wait for the process
        // to terminate before marking the build complete assuming that there is some lagging cleanup task.
        // While this is a good assumption generally, it causes problems here so we will trigger offline bundling manually
        // and update the packager server startup script to only start if an environment var is not set.
        //
        // **TODO: Submit PR to react-native project so we no longer have to do this. Sync up detection if a patch has
        //         already been applied so that it is not done for React Native projects after the PR has been accepted.
        //
        // Look through all xpbproj files and add in reference to skip if running in CI env
        var projFiles = glob.sync(xcodeProject);

        if (projFiles.length == 0) {
            taskLibrary.setResult(1, "No Xcode project file(s) matching '" + xcodeProject + "' found.");
        }

        projFiles.forEach(function(projFile) {
            taskLibrary.debug("Platform is iOS - attempting to patch main Xcode project for CI env: " + projFile);

            var pbxprojContents;
            try {
                pbxprojContents = fs.readFileSync(projFile, 'utf8');
            }
            catch(err) {
                taskLibrary.setResult(1, "Error opening Xcode project file '" + projFile + "'. Is it a valid file?");
            }

            // By default RN versions 0.19 and above have this line in the project file, to do the bundling:
            // shellScript = "export NODE_BINARY=node\n../node_modules/react-native/packager/react-native-xcode.sh";

            var bundleShell = pbxprojContents.match(/".*react-native-xcode.sh.*";/mi);
            if (bundleShell) {
                // Strip off the quotes and trailing ;
                bundleShell = bundleShell[0].substring(1, bundleShell[0].length-2);

                // Strip off export NODE_BINARY=....\n, if it's present
                var newBundleShell = bundleShell.replace(/export NODE_BINARY=.*?\\n/i, '');

                // Now add back on setting NODE_BINARY to the node path we want to use
                var nodePath = path.join(nodeManager.getNodePath(), 'node');
                newBundleShell = 'export NODE_BINARY=\'' + nodePath + '\'\\n' + newBundleShell;

                if (newBundleShell !== bundleShell) {
                    taskLibrary.debug('Patching ' + projFile + '...');
                    taskLibrary.debug('replacing: ' + bundleShell);
                    taskLibrary.debug('with this: ' + newBundleShell);

                    pbxprojContents = pbxprojContents.replace(bundleShell, newBundleShell);
                    fs.writeFileSync(projFile,pbxprojContents, 'utf8');
                }
                else {
                    taskLibrary.debug("Main Xcode project already patched with desired node path: " + bundleShell);
                }
            } else {
                taskLibrary.debug("Main Xcode project does not require patching (no invocation of react-native-xcode.sh found).");
            }
        });
    }

    // Match react native node module (big hack)
    var reactProj = path.join(workingDirectory,'node_modules','react-native','React','React.xcodeproj','project.pbxproj');
    taskLibrary.debug("Platform is iOS - attempting to patch React.xcodeproj for CI env: " + reactProj);
    var pbxprojContents = fs.readFileSync(reactProj, 'utf8');

    // By default RN has this line in the React.xcodeproj file, to launch the packager:
    // shellScript = "if nc -w 5 -z localhost 8081 ; then\n  if ! curl -s \"http://localhost:8081/status\" | grep -q \"packager-status:running\" ; then\n    echo \"Port 8081 already in use, packager is either not running or not running correctly\"\n    exit 2\n  fi\nelse\n  open \"$SRCROOT/../packager/launchPackager.command\" || echo \"Can't start packager automatically\"\nfi";

    var launchPackagerShell = pbxprojContents.match(/".*launchPackager.command.*";/mi);
    if (launchPackagerShell) {
        launchPackagerShell = launchPackagerShell[0].substring(1, launchPackagerShell[0].length-2);

        var comment = "# Don't launch packager for CI builds";
        if (launchPackagerShell.indexOf(comment) < 0) {
            taskLibrary.debug("Patching React.xcodeproj, adding an exit so it doesn't try to launch the packager.");

            var newLaunchPackagerShell='exit 0 ' + comment + '\\n' + launchPackagerShell;
            pbxprojContents=pbxprojContents.replace(launchPackagerShell, newLaunchPackagerShell);
            fs.writeFileSync(reactProj,pbxprojContents, 'utf8');
        } else {
            taskLibrary.debug("React.xcodeproj already patched to not launch packager.");
        }
    } else {
        taskLibrary.debug("React.xcodeproj does not require patching (no invocation of launchPackager.sh found).");
    }
}

function fixGradleProj() {
    var reactGradle = taskLibrary.getInput('reactGradle', false);

    if (! reactGradle || reactGradle === '' || reactGradle === buildSourceDirectory) {
        taskLibrary.debug("No react.gradle property set, so react.gradle won't be patched.");
    }
    else {
        var reactGradleFiles = glob.sync(reactGradle);

        if (reactGradleFiles.length == 0) {
            taskLibrary.setResult(1, "No react.gradle file(s) matching '" + reactGradle + "' found.");
        }

        reactGradleFiles.forEach(function(reactGradleFile) {
            // We can't easily call "bundle" outside of the build process since the target build folder is wiped out as a result of a native build
            // Bundle is part of the Gradle build process and fortunately does not start up the packager via the build command - but we do need to
            // set things up to use specific node version As a result we instead need to simply update the reference to the node version in
            // react.gradle and then let the build do its thing
            var reactGradleContents = fs.readFileSync(reactGradleFile, 'utf8');
            if (reactGradleContents.indexOf('"react-native", "bundle",') < 0) {
                taskLibrary.debug("react.gradle file '" + reactGradleFile + "' already patched.");
            } else {
                taskLibrary.debug("Platform is Android - attempting to patch react.gradle to use specified node version: " + reactGradleFile);
                var nodePath = path.join(nodeManager.getNodePath(), 'node');
                var cliPath = path.join(workingDirectory, 'node_modules', 'react-native', 'local-cli','cli.js').replace(/\\/g,'\\\\' );
                var newContents = reactGradleContents.replace(/"react-native",\s?"bundle",/gm, '"'+ nodePath.replace(/\\/g,'\\\\' ) + '", "' + cliPath + '", "bundle",');
                fs.writeFileSync(reactGradleFile, newContents,'utf8');
            }
        });
    }
}