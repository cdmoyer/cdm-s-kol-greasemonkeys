// CDM's Tabbed KoL
// Copyright (c) 2006, Chris Moyer
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           CDM's Tabbed KoL Chat
// @namespace      http://hogsofdestiny.com/
// @include        *kingdomofloathing.com/lchat.php
// @include        http://127.0.0.1:*/lchat.php
// @description    Version 0.5.5 - Tabbed Chat Interface for KoL
//
// ==/UserScript==

/*************************** Description ***************************
 CDMoyer's Tabbed KoL Chat.

 Each channel and PM conversation appear in a tab.

 Tabs turn red when there are new messages.

 When a tab is selected, the channel or /msg user is automatically
 added to messages you send.

 /clear and /mark work.

 Double clicking a tab closes it.  (But doesn't /clear the buffer)
 It will come back if more text appears.

 It's new, report bugs via KMail to CDMoyer.

 Click the ? at the top left to see help.

 /options to list options and /option FEATURE to toggle them.
 These are saved persistently.

 /sets to list variables, and /set to set them

 ctrl-left and ctrl-right to switch tabs

TODO:

 
*******************************************************************/

/*************************** Change Log ***************************

Latest Update:
0.5.5:  Made it easier to read scrollback
        Fixed bug wherein /mark wouldn't cause a scroll
		Upgraded /mark to the new version
0.5.4:  Handle macros
        Only do /who at the beginning of a line
0.5.3:  Fixed emotes when channel tags are off.
0.5.2a: Minor bugfix from last
0.5.2:  Manage some /w(ho) ambiguity
        Don't add extra spaces around whoiseses
        Added /set 
        Added /set buffer
		Added /option verticalkeys
0.5.1:  Don't prepend channel for current channel
0.5:    Added /option alltab
0.4.5:  More PM issues, apparently sometimes PMs have no class (duh)
0.4.4:  Added /option greentoactive
0.4.3:  Added /clearall and /clsa
0.4.2:  Fixed UpUp tagged player's PMs
0.4.1:  Fixed key-bound movement between tabs with closed tabs
        Fixed som PMs going to default
		Seems like colors may be fixed from Mod announcements and such
0.4:    Added /option and /options, moved debug there
        Better handle names with spaces
        Added /option hidetags
        Added /option timestamp
		Added Ctrl-Left and Ctrl-Right keybindings
0.3.2:  Focus the input box when changing tabs
0.3.1:  Work without "show channel tags in current channel"
0.3:    Handle /haiku
0.2.1:  Fixed scrolling to bottom when focusing a tab
0.2:    /debug added
        Chat restart messages should appear in the active tab.
	    When you leave a tab, a small blue line should be placed below
	     the last text.
        Updated help text		 
	     
0.1:    Initial release

*******************************************************************/





var CTC_TAB_HEIGHT = 25;
var CTC_MARKER = '<!--CDROCKS--><hr style="width: 50%; background-color: #00f; height: 4px;" id="ID" /><!--CDROCKS-->';
var CTC_HELP = 	"CDMoyer's Tabbed KoL Chat\n\nClick on the stuff at the top to change channels.\nMessages and such appear in 'Default'.\nDouble Click a channel to close it's tab (you are still in or listening to it... it will reappear if new text enters that channel)\n\n/clear and /mark work to clear a buffer and mark a position. (and /clearall or /clsa clear all tabs)\n\n/options in any tab to see options to set with /option\n/set to see and then set various variables\n\nCtrl-Left and Ctrl-Rigth will switch tabs\n";


var CTC_OPTIONS = new Object;
CTC_OPTIONS['alltab'] = 'Include the almighty All tab, with all messages as one';
CTC_OPTIONS['debug'] = 'Show Debugging tab';
CTC_OPTIONS['greentoactive'] = 'Send things that normally go to Default to your currently active tab.';
CTC_OPTIONS['hidetags'] = 'Remove channel tags from tabs.';
CTC_OPTIONS['timestamp'] = 'Mark lines with a timestamp.[hh:mm]';
CTC_OPTIONS['verticalkeys'] = 'Use ctrl-up and ctrl-down for changing tabs.';

var CTC_SETS = new Object;
var CTC_SETS_DEF = new Object;
CTC_SETS['buffer'] = 'Max channel buffer size, in characters (0 is infinite)';
CTC_SETS_DEF['buffer'] = 15000;


document.ctc_get_set = function (set) {
	var val = GM_getValue(set);
	if (val == null) { return CTC_SETS_DEF[set]; }
	else { return val; }
}

document.getElementById("ChatWindow").style.display = 'none';

var s = document.createElement('style');
s.setAttribute('type', 'text/css')
s.innerHTML = '.ctc_div { position: absolute; padding: 2px; top: '+(CTC_TAB_HEIGHT+2) +'px; left: 2px; font-family: arial; width: 100%; font-size: 12px; height: 270; border: 1px solid black; overflow-y: scroll; overflow-x: hidden; overflow: auto; } ' + "\n" +
'.ctc_tabs { border: 1px solid black; position: absolute; padding: 2px; top: 2px; left: 2px; width: 100%; }' + "\n" +
'.ctc_tab_on { color: #000; background-color: #ccf; padding: 1px}' + "\n" +
'.ctc_tab_new { color: #000; background-color: #f00; padding: 1px}' + "\n" +
'.ctc_tab { color: #000; background-color: #fff; padding: 1px}' + "\n" +
'.ctc_tab_on:visited { color: #000; background-color: #ccf; padding: 1px}' + "\n" +
'.ctc_tab_new:visited { color: #000; background-color: #fcc; padding: 1px}' + "\n" +
'.ctc_tab:visited { color: #000; background-color: #fff; padding: 1px}' + "\n";
document.body.appendChild(s);

var mdiv = document.createElement('div');
mdiv.id = 'ctc_div';
mdiv.className = 'ctc_div';
document.body.appendChild(mdiv);


var tabs = document.createElement('div');
tabs.id = 'ctc_tabs';
tabs.style.display='block';
tabs.className='ctc_tabs';
document.body.appendChild(tabs);


document.body.removeChild(document.getElementById('menu'));
var rcm = document.createElement('div');
rcm.id = 'menu';
rcm.className = 'rcm';
document.body.appendChild(rcm);

document.ctc_help = function() {
	alert(CTC_HELP);
}

document.ctc_size = function () {
		if (navigator.appName.indexOf("Explorer")!=-1) {
			w=document.body.offsetWidth-5;
		}	else {
			w=self.innerWidth-24;
		}
		document.getElementById("ctc_div").style.width=w;
		document.getElementById("ctc_tabs").style.width=w;
		document.getElementById("InputForm").style.width=w;
		document.getElementById("ctc_div").style.height=document.body.clientHeight-document.getElementById("InputForm").offsetHeight-6 - document.getElementById('ctc_tabs').offsetHeight - 6;
		document.getElementById("ctc_div").style.top = 3 + (document.getElementById('ctc_tabs').offsetHeight);
}

document.ctc_originitsizes = unsafeWindow.initsizes;
unsafeWindow.initsizes = document.ctc_size;


document.ctc_trunc_chat = function (chan) {
	var max = document.ctc_get_set('buffer');
	if (max == 0) { return;} 

	len = document.ctc_chats[chan].length;
	
	if (len > max) {
		rep = document.ctc_chats[chan].substring(len-max,len);
		rep = rep.substring(rep.indexOf('<br'),max);
		document.ctc_chats[chan] = rep;
		if (chan == document.ctc_currentchat) {
			document.getElementById('ctc_div').innerHTML = rep;
		}
	}
}

document.ctc_killtab = function (chan) {
	if (chan == 'default') { return false; }
	tab = document.getElementById('ctc_tab_'+chan);
	if (tab) { 
		if (confirm('Close the tab "'+chan+'"? (OK to Close)')) {
			document.getElementById('ctc_tabs').removeChild(tab); 
			document.ctc_showchat('default');
			document.ctc_size();
		}
	}
	return false;
}


document.ctc_showchat = function (chan) {
	tab = document.getElementById('ctc_tab_'+document.ctc_currentchat)
	if(tab) { tab.className = 'ctc_tab'; }

	var marker = CTC_MARKER.replace('ID', 'mark_'+document.ctc_currentchat);
	document.ctc_chats[document.ctc_currentchat] = document.ctc_chats[document.ctc_currentchat].replace(marker, '') + marker;
	
	document.ctc_currentchat = chan;
	document.getElementById('ctc_div').innerHTML = document.ctc_chats[chan];
	dv = document.getElementById('ctc_div');
	dv.scrollTop = dv.scrollHeight - dv.clientHeight;

	foo = document.getElementsByName('graf');
	foo[0].focus();

	var tab = document.getElementById('ctc_tab_'+chan);
	if (tab) {
		tab.className = 'ctc_tab_on';
	}
}

document.ctc_addchat = function (channel, line, noall) {
	if (!document.getElementById('ctc_tab_'+channel)) {
		var a = document.createElement('a');
		a.href='#';
		a.id = 'ctc_tab_' + channel;
		a.className = 'ctc_tab';
		title = document.createTextNode('|'+(channel.substr(0,1).toUpperCase() + channel.substr(1,channel.length))+'| ');
		a.addEventListener('click', function () {document.ctc_showchat(channel); return false;}, true);
		a.addEventListener('dblclick', function () {return document.ctc_killtab(channel)}, true);
		a.appendChild(title);

		document.getElementById('ctc_tabs').appendChild(a);
		document.ctc_size();
	}

	if (!noall && GM_getValue('alltab')) {
		document.ctc_addchat('all', line, true);
	}

	if (!document.ctc_chats[channel]) { document.ctc_chats[channel] = ""; }

	if (GM_getValue('hidetags', false) && channel != 'default' && channel.indexOf('>') != 0) {
		line = line.replace('['+channel+']', '');
	}

	if (GM_getValue('timestamp', false) && line.match(/showplayer\.php/)) {
		now = new Date();
		hours = now.getHours();
		mins = now.getMinutes();
		if (hours < 10) { hours = '0' + hours; }
		if (mins < 10) { mins = '0' + mins; }
		line = '['+ hours+':'+ mins+'] ' + line;
	}

	var justfont = (line == '</font>');
	var br = (justfont ? '' : '<br/>');
	document.ctc_chats[channel] += line + br;

	if (channel == document.ctc_currentchat) {
		dv = document.getElementById('ctc_div');
		// If we're already scrolled back a bit, we don't scroll more after
		// we update the chat pane. This will, hopefully, keep us from
		// bouncing away when someone's trying to read their scrollback
		var autoscroll = (dv.scrollTop == dv.scrollHeight - dv.clientHeight) ?
			true : false;
		
		document.getElementById('ctc_div').innerHTML += line + br;
		if (autoscroll)
		{
			dv.scrollTop = dv.scrollHeight - dv.clientHeight;
		}
		
	}
	else if(!justfont) {
		var tab = document.getElementById('ctc_tab_'+channel);
		if (tab) {
			tab.className = 'ctc_tab_new';
		}
	}

	document.ctc_trunc_chat(channel);
}

//window.setTimeout(document.ctc_size, 2000);

document.ctc_currentchat = 'default';
document.ctc_chats = new Object;
document.ctc_inchannel = 'default';

document.ctc_lasttextchannel = '';
document.ctc_loop = function () {
	var chat = document.getElementById("ChatWindow").innerHTML.replace(/<!--lastseen:[0-9]+-->/g,'');
	if (chat.length > 0) {
		var lines = chat.split("<br>");
		for (i = 0; i < lines.length; i++) {
			var channel = 'default';
			var line = lines[i];
			var channelreg = /<font color="[#0-9a-z]*">\[([^\]]+)\]</; 
			var channel2reg = /table><tbody><tr><td class="tiny"><center><b>Players in channel ([^:]+):</;
			if (match = channelreg.exec(line) ) {
				channel = match[1];
			}
			if (match2 = channel2reg.exec(line) ) {
				channel = match2[1];
			}
			if (channel == 'link') { channel = 'default'; }

			// Only dig further if unchanneled
			if ((channel == '' || channel == 'default') && line.indexOf('color="blue"') != -1) {
				var pmreg = /<font color="blue"><b>private to <a[^>]*><font[^>]*>([^<]+)</;
				var pmreg2 = /<a[^>]*><font[^>]*>(?:<b>)?([^(]+) \(private\):/;
			
				if (match3 = pmreg.exec(line)) {
					channel = '>'+match3[1].replace(/ /g, '_');
				}
				if (match4 = pmreg2.exec(line)) {
					channel = '>'+match4[1].replace(/ /g, '_');
				}
			}
			
			// More random things
			if (channel == '' || channel == 'default') {
				if (line.indexOf('<a href="javascript:restartchat();">Click Here') != -1) {
					channel = document.ctc_currentchat;
				}
				else if(line.indexOf('Now listening to channel: ') != -1) {
					var m  = /Now listening to channel: ([^<]*)</.exec(line);
					if (m && m[1] != '') { channel = m[1]; }
				}
				else if(line.indexOf('No longer listening to channel: ') != -1) {
					var m  = /No longer listening to channel: ([^<]*)</.exec(line);
					if (m && m[1] != '') { channel = m[1]; }
				}
				else if(line.indexOf('Currently in channel: ') != -1) {
					var m  = /Currently in channel: ([^<]*)</.exec(line);
					if (m && m[1] != '') { 
						channel = m[1]; 
						document.ctc_inchannel = channel;
						if (GM_getValue('debug', false)) {document.ctc_addchat('D','<b>INCHANNEL = '+channel+'</b>'); }
					}
				}
				else if(line.indexOf('You are now talking in channel: ') != -1) {
					var m  = /You are now talking in channel: ([^<]*)\.</.exec(line);
					if (m && m[1] != '') { 
						channel = m[1]; 
						document.ctc_inchannel = channel;
						if (GM_getValue('debug', false)) {document.ctc_addchat('D','<b>INCHANNEL = '+channel+'</b>'); }
					}
				}
				else if(line.indexOf('<') == -1 && document.ctc_lasttextchannel == 'haiku') {
					channel = 'haiku';
				}
				else if(line.indexOf('<b>') == 0 || line.indexOf('<i><b>') == 0) {
					channel = document.ctc_inchannel;
				}
			}

			if(line.indexOf('</font>') == 0) {
				document.ctc_addchat(document.ctc_lasttextchannel,'</font>', true);
			}

			if (line != '') {
				if (channel == 'default' && GM_getValue('greentoactive', false)) {
					channel = document.ctc_currentchat;
				}
				document.ctc_addchat(channel, line);
			}

			document.ctc_lasttextchannel = channel;

			if (GM_getValue('debug', false)) {document.ctc_addchat('D',line.replace(/</g,'&lt;').replace(/>/, '&gt;') + '---' + channel + '---');}
		}
	}
	document.getElementById("ChatWindow").innerHTML = "";
	window.setTimeout(document.ctc_loop, 2500);
}

var helpl = document.createElement('a');
helpl.href = '#';
helpl.appendChild(document.createTextNode('?  '));
helpl.addEventListener('click', function () { document.ctc_help(); }, true);
document.getElementById('ctc_tabs').appendChild(helpl);


document.ctc_inputmunge = function () {
	foo = document.getElementsByName('graf');
	txt = foo[0].value;
	//if (txt.substring(0,9) == '/own-tab ') {
		//user = txt.substring(5);
	//}
	if ((txt.indexOf('/') != 0 || txt.indexOf('/me') == 0 || txt.indexOf('/em') == 0 || txt.match('^/[0-9]'))  && document.ctc_currentchat != 'default' 
			&& document.ctc_currentchat != 'all' 
			&& document.ctc_currentchat != document.ctc_inchannel
			&& txt != '') {
		if (document.ctc_currentchat.indexOf('>') == 0) {
			foo[0].value = '/msg ' + (document.ctc_currentchat.replace(/ /g,'_').replace(/^>/, '')) + ' ' + foo[0].value;
		}
		else {
			foo[0].value = '/' + (document.ctc_currentchat) + ' ' + foo[0].value;
		}
		return true;
	}
	else if (txt.match('^/w(?:ho)? *$') && document.ctc_currentchat != 'default' &&
			 document.ctc_currentchat.indexOf('>') != 0) {
		foo[0].value = '/who ' + (document.ctc_currentchat);
		return true;
	}
	else if (txt == '/cls' || txt == '/clear') {
		document.ctc_chats[document.ctc_currentchat] = '<!-- -->';
		document.getElementById('ctc_div').innerHTML = '<!-- -->';
		return false;
	}
	else if (txt == '/clsa' || txt == '/clearall') {
		for (var c in document.ctc_chats) {
			document.ctc_chats[c] = '<!-- -->';
		}
		document.getElementById('ctc_div').innerHTML = '<!-- -->';
		return false;
	}
	else if (txt.indexOf('/option') == 0) {
		document.ctc_showchat('default');
		if (txt.indexOf('/options') != 0) {
			var match = /option ([a-z]*)/i.exec(txt);
			if (match) {
				cmd = match[1];
				if (CTC_OPTIONS[cmd]) {
					GM_setValue(cmd, !GM_getValue(cmd, false));
					document.ctc_addchat('default', 'Option: '+cmd+' set to <b>'+(GM_getValue(cmd, false) ? 'true' : 'false')+'</b>');
				}
				else {
					document.ctc_addchat('default', 'Invalid option: <b>'+cmd+'</b>.  Type <b>/options</b> for option list');
				}
				return false;
			}
		}

		document.ctc_addchat('default', '<br/><b>Options (toggle with /option XXXX)</b>');
		for (var cmd in CTC_OPTIONS) {
			document.ctc_addchat('default', '/option <b>'+cmd+'</b> [<b>'+(GM_getValue(cmd, false)?'true':'false')+'</b>] - '+CTC_OPTIONS[cmd]);
		}
		return false;
	}
	else if (txt.indexOf('/set') == 0) {
		document.ctc_showchat('default');
		if (txt.indexOf('/sets') != 0) {
			var match = /set ([a-z]*) (.*)/i.exec(txt);
			if (match) {
				set = match[1];
				val = match[2];
				if (CTC_SETS[set]) {
					GM_setValue(set, val);
					document.ctc_addchat('default', 'Variable: '+set+' set to <b>'+val+'</b>');
				}
				else {
					document.ctc_addchat('default', 'Invalid variable: <b>'+set+'</b>.  Type <b>/sets</b> for variable list');
				}
				return false;
			}
		}

		document.ctc_addchat('default', '<br/><b>Variables (set with /set VAR XXXX)</b>');
		for (var cmd in CTC_SETS) {
			document.ctc_addchat('default', '/set <b>'+cmd+'</b> [<b>'+document.ctc_get_set(cmd)+'</b>] - '+CTC_SETS[cmd]);
		}
		return false;
	}
	else if (txt == '/mark') {
		var d = new Date();
		var line = '<center style="tiny">&mdash;&mdash;&mdash;&nbsp;' + (d.getHours()%12) + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' + (d.getSeconds() <10 ? '0' + d.getSeconds() : d.getSeconds()) + '&nbsp;&mdash;&mdash;&mdash;</center>';
		document.ctc_chats[document.ctc_currentchat] += line;
		document.getElementById('ctc_div').innerHTML += line;
		dv.scrollTop = dv.scrollHeight - dv.clientHeight;
		return false;
	}

	return true;
}

document.ctc_oldsubmitchat = unsafeWindow.submitchat;
unsafeWindow.submitchat = function (override) {
	if (document.ctc_inputmunge()) {
		document.ctc_oldsubmitchat(override);
	}
	else {
		foo = document.getElementsByName('graf');
		foo[0].value = '';
	}
}

document.ctc_keys = function (ev) {
	var goto = 0;
	var left = 37;
	var right = 39;
	if (GM_getValue('verticalkeys', false)) {
		left = 38;
		right = 40;
	}

	
	if (!ev.ctrlKey || (ev.keyCode != left && ev.keyCode != right)) {
		return true;
	}

	var tabs = document.evaluate(
		"//div[@id='ctc_tabs']/a[@id]",
		document,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null);

	if (ev.ctrlKey && ev.keyCode == left) {
		var last = 0;
		for (var i=0; i< tabs.snapshotLength; i++) {
			c = tabs.snapshotItem(i).getAttribute('id').replace('ctc_tab_', '');
			if (c == document.ctc_currentchat) {
				goto = last;
			}
			last = c;
		}
		if (!goto) { goto = last; }
	}
	else if (ev.ctrlKey && ev.keyCode == right) {
		var first = 0;
		var next = 0;
		for (var i=0; i< tabs.snapshotLength; i++) {
			c = tabs.snapshotItem(i).getAttribute('id').replace('ctc_tab_', '');
			if (!first) { first = c; }
			if (next) { goto = c; next = 0; }
			if (c == document.ctc_currentchat) {
				next = 1;
			}
		}
		if (!goto) { goto = first; }
	}
	if (goto) {
		document.ctc_showchat(goto);
		return false;
	}
	return true;
}

window.addEventListener('keypress', document.ctc_keys, true);

//unsafeWindow.actions["/own-tab"] = {"action":2, "useid" : false, true};

document.ctc_addchat('default', '<b>'+CTC_HELP.replace(/\n/g, '<br>').replace(/Chat/,'Chat</b>') + '<hr/><br/>', true);

foo = document.getElementsByName('graf');
foo[0].focus();

if (GM_getValue('alltab', false)) {
	document.ctc_addchat('all', '<font color="green">Welcome to the Almighty All Tab</font>', true);
}

document.ctc_loop();
