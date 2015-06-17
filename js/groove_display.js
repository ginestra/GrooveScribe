// groove_display.js
// utility functions to support displaying a groove on a page

	// GrooveDisplay class.   The only one in this file.
	// singleton
	if (typeof (GrooveDisplay) === "undefined") { "use strict";
							
		var GrooveDisplay = {};
		
		(function() { "use strict";

			var root = GrooveDisplay;

					// list of files already added
			root.filesadded = "";

			root.getLocalScriptRoot = (function() {
				var scripts = document.getElementsByTagName('script');
				var index = scripts.length - 1;
				var myScript = scripts[index];
				var lastSlash = myScript.src.lastIndexOf("/");
				myScript.rootSrc = myScript.src.slice(0, lastSlash + 1);
				return function() { return myScript.rootSrc; };
			})();
		 
			root.checkloadjscssfile = function(filename, filetype){
				if (filesadded.indexOf("["+filename+"]")==-1){
					root.loadjscssfile(filename, filetype)
					root.filesadded+="["+filename+"]" //List of files added in the form "[filename1],[filename2],etc"
				}
				else
					alert("file already added!")
			}

			root.loadjscssfile = function(filename, filetype) {
				if(filename[0] == ".") {   // relative pathname 
					filename = root.getLocalScriptRoot() + filename;
				}
				
				if (root.filesadded.indexOf("["+filename+"]")!=-1)
					return;   // file already added
				
				if (filetype=="js"){ //if filename is a external JavaScript file
					var fileref=document.createElement('script')
					fileref.setAttribute("type","text/javascript")
					fileref.setAttribute("src", filename)
				}
				else if (filetype=="css"){ //if filename is an external CSS file
					var fileref=document.createElement("link")
					fileref.setAttribute("rel", "stylesheet")
					fileref.setAttribute("type", "text/css")
					fileref.setAttribute("href", filename)
				}
				if (typeof fileref!="undefined")
					document.getElementsByTagName("head")[0].appendChild(fileref)
			}

				//	<!--   midi.js package for sound   -->
			root.loadjscssfile("./MIDI/AudioDetect.js", "js");
			root.loadjscssfile("./MIDI/LoadPlugin.js", "js");
			root.loadjscssfile("./MIDI/Plugin.js", "js");
			root.loadjscssfile("./MIDI/Player.js", "js");
			root.loadjscssfile("./Window/DOMLoader.XMLHttp.js", "js");
				//	<!-- jasmid package midi package required by midi.js above -->
			root.loadjscssfile("../inc/jasmid/stream.js", "js");
			root.loadjscssfile("../inc/jasmid/midifile.js", "js");
			root.loadjscssfile("../inc/jasmid/replayer.js", "js");
				//	<!-- jsmidgen -->
			root.loadjscssfile("./jsmidgen.js", "js");
				//	<!-- extras -->
			root.loadjscssfile("../inc/Base64.js", "js");
			root.loadjscssfile("../inc/base64binary.js", "js");
				//	<!-- script to render ABC to an SVG image -->
			root.loadjscssfile("./abc2svg-1.js", "js");
					
				//	<!--   our custom JS  -->
			root.loadjscssfile("./groove_utils.js", "js");
					
				// stylesheet	
			root.loadjscssfile("../css/groove_display.css", "css");
		   
			root.GrooveDisplayUniqueCounter = 1;
			
			// time signature looks like this  "4/4", "5/4", "6/8", etc   
			// Two numbers separated by a slash
			// return an array with two elements top and bottom in that order
			function parseTimeSignature(timeSig) {
			
				
				var timeSigTop = 4;
				var timeSigBottom = 4;
			
				if(timeSig) {
					var splitResults = timeSig.split("/");
				
					if(splitResults.length == 2) {
						timeSigTop = Math.ceil(splitResults[0]);
						timeSigBottom = Math.ceil(splitResults[1]);
					}
				}
				
				return [timeSigTop, timeSigBottom];
			}
			
			// Used by the GrooveDB to display a groove on a page.
			// Supports multiple grooves on one page as well.
			// shows the groove via SVG sheet music and a midi player
			root.GrooveDBFormatPutGrooveInHTMLElement = function(HtmlTagId, GrooveDBTabIn) {
				var myGrooveUtils = new GrooveUtils();	
				var myGrooveData = new myGrooveUtils.grooveData();
				
				var combinedSnareTab = myGrooveUtils.mergeDrumTabLines(GrooveDBTabIn.snareAccentTab, GrooveDBTabIn.snareOtherTab);
				var combinedKickTab  = myGrooveUtils.mergeDrumTabLines(GrooveDBTabIn.kickTab, GrooveDBTabIn.footOtherTab);
				
				
				myGrooveData.tempo = GrooveDBTabIn.tempo;
				myGrooveData.numberOfMeasures = GrooveDBTabIn.measures;
				myGrooveData.showMeasures = GrooveDBTabIn.measures;
				myGrooveData.notesPerMeasure = GrooveDBTabIn.notesPerTabMeasure;
				myGrooveData.sticking_array = myGrooveUtils.noteArraysFromURLData("Stickings", "", GrooveDBTabIn.notesPerTabMeasure, GrooveDBTabIn.measures);
				myGrooveData.hh_array = myGrooveUtils.noteArraysFromURLData("H", GrooveDBTabIn.hihatTab, GrooveDBTabIn.notesPerTabMeasure, GrooveDBTabIn.measures);
				myGrooveData.snare_array = myGrooveUtils.noteArraysFromURLData("S", combinedSnareTab, GrooveDBTabIn.notesPerTabMeasure, GrooveDBTabIn.measures);
				myGrooveData.kick_array = myGrooveUtils.noteArraysFromURLData("K", combinedKickTab, GrooveDBTabIn.notesPerTabMeasure, GrooveDBTabIn.measures);

				var timeSig = parseTimeSignature(GrooveDBTabIn.timeSignature);
				myGrooveData.numBeats = timeSig[0];
				myGrooveData.noteValue = timeSig[1];
				
				//console.log(myGrooveData);
				
				var svgTargetId = "SVG-" + root.GrooveDisplayUniqueCounter;
				var midiPlayerTargetId = "Player-" + root.GrooveDisplayUniqueCounter;
				
				// spit out some HTML tags to hold the music and possibly the player
				document.getElementById(HtmlTagId).innerHTML = '' +
								'<div id="' + svgTargetId + '" class="svgTarget" style="display:inline-block"></div>\n' +
								'<div id="' + midiPlayerTargetId + '" style="width: 260px; display:inline-block; vertical-align: bottom"></div>\n';
								
				var abcNotation = myGrooveUtils.createABCFromGrooveData(myGrooveData);
				var svgReturn = myGrooveUtils.renderABCtoSVG(abcNotation);
				
				document.getElementById(svgTargetId).innerHTML = svgReturn.svg;
				
				myGrooveUtils.setGrooveData(myGrooveData);

				myGrooveUtils.AddMidiPlayerToPage(midiPlayerTargetId, myGrooveData.notesPerMeasure, true);
				myGrooveUtils.expandOrRetractMIDI_playback(true, false);  // make it small
				myGrooveUtils.setTempo(GrooveDBTabIn.tempo);
				myGrooveUtils.oneTimeInitializeMidi();
				
				root.GrooveDisplayUniqueCounter++;
			}
			
			// Add a groove to a page
			root.GrooveDBFormatPutGrooveOnPage = function (GrooveDBTabIn) {
				root.GrooveDisplayUniqueCounter++;
				
				// add an html Element to hold the grooveDisplay
				var HTMLElementID = 'GrooveDisplay' + root.GrooveDisplayUniqueCounter;
				document.write('<div id="' + HTMLElementID + '"></div>');
				
				window.addEventListener("load", function() { root.GrooveDBFormatPutGrooveInHTMLElement(HTMLElementID, GrooveDBTabIn);}, false);
			}
			
			
			root.displayGrooveInHTMLElementId = function (HtmlTagId, GrooveDefinition, showPlayer, linkToEditor) {
					var myGrooveUtils = new GrooveUtils();
					root.GrooveDisplayUniqueCounter++;
					
					var svgTargetId = "svgTarget" + root.GrooveDisplayUniqueCounter;
					var midiPlayerTargetId = "midiPlayerTarget" + root.GrooveDisplayUniqueCounter;
				
					document.getElementById(HtmlTagId).innerHTML = '' +
							'<div id="' + svgTargetId + '" class="svgTarget" style="display:inline-block"></div>\n' +
							'<div id="' + midiPlayerTargetId + '" style="width: 260px; display:inline-block; vertical-align: bottom"></div>\n';
							
					// load the groove from the URL data if it was passed in.
					var GrooveData = myGrooveUtils.getGrooveDataFromUrlString(GrooveDefinition);
					console.log(GrooveData);
					var abcNotation = myGrooveUtils.createABCFromGrooveData(GrooveData);
					var svgReturn = myGrooveUtils.renderABCtoSVG(abcNotation);
					
					if(linkToEditor)
						document.getElementById(svgTargetId).innerHTML = '<a style="text-decoration: none" href="' + linkToEditor + GrooveDefinition + '">' + svgReturn.svg + '</a>';
					else
						document.getElementById(svgTargetId).innerHTML = svgReturn.svg;
					
					if(showPlayer) {
						myGrooveUtils.setGrooveData(GrooveData);
					
						myGrooveUtils.AddMidiPlayerToPage(midiPlayerTargetId, GrooveData.notesPerMeasure, true);
						myGrooveUtils.expandOrRetractMIDI_playback(true, false);  // make it small
						myGrooveUtils.oneTimeInitializeMidi();
					}
			}
			
			// Add a groove to a page
			root.AddGrooveDisplayToPage = function (URLEncodedGrooveData, showPlayer, linkToEditor) {
				root.GrooveDisplayUniqueCounter++;
				
				// add an html Element to hold the grooveDisplay
				var HTMLElementID = 'GrooveDisplay' + root.GrooveDisplayUniqueCounter;
				document.write('<div id="' + HTMLElementID + '"></div>');
				
				window.addEventListener("load", function() { root.displayGrooveInHTMLElementId(HTMLElementID, URLEncodedGrooveData, showPlayer, linkToEditor);}, false);
			}
		})();  // end of class GrooveDisplay		
	}  // end if						
			