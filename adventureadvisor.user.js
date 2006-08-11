// Tard's KoL Scripts
// Copyright (c) 2006, Byung Kim
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Tard's KoL Scripts - Adventure Advisor
// @namespace      http://kol.dashida.com
// @include        *kingdomofloathing.com/main_c.html
// @include        *kingdomofloathing.com/main.html
// @include        *kingdomofloathing.com/rats.ph*
// @include        *kingdomofloathing.com/fight.ph*
// @include        *kingdomofloathing.com/desc_item.php?tardAdvAdv
// @description    Version 0.6
//
// ==/UserScript==


/********************************** Change Log **********************************************
Refer to the following for past updates:
http://kol.dashida.com/

Latest Update:
- CDMoyer added last square highlighting

********************************************************************************************/

//Cookie Functions
getCookie = function(cName) {var strC = document.cookie;var s = cName + "=";var i1 = strC.indexOf("; " + s);if (i1 == -1) {	i1 = strC.indexOf(s);	if (i1 != 0) return null;} else i1 += 2;var i2 = document.cookie.indexOf(";", i1);if (i2 == -1) i2 = strC.length;return unescape(strC.substring(i1 + s.length, i2));};
getCookieVar = function(cName, arg) {var cVal = getCookie(cName);cStr = (cVal == 0 ? "" : cVal);if (cStr && cStr.indexOf(arg) != -1) {var i1 = cStr.indexOf(arg);var i2 = cStr.indexOf("&", i1);if (i2 == -1) i2 = cStr.length;var strVars = cStr.substring(i1,i2);var i1 = (strVars.indexOf("=") + 1);var i2 = strVars.length;var strVars = strVars.substring(i1,i2);strVars = unescape(strVars);} else {var strVars = "";}return strVars;};
setTimeout('' +
	'getCookieVar = function(cName, arg) {var strC = document.cookie;var s = cName + "=";var i1 = strC.indexOf("; " + s);if (i1 == -1) {	i1 = strC.indexOf(s);	if (i1 != 0) return null;} else i1 += 2;var i2 = document.cookie.indexOf(";", i1);if (i2 == -1) i2 = strC.length;var cVal = unescape(strC.substring(i1 + s.length, i2));cStr = (cVal == 0 ? "" : cVal);if (cStr && cStr.indexOf(arg) != -1) {var i1 = cStr.indexOf(arg);var i2 = cStr.indexOf("&", i1);if (i2 == -1) i2 = cStr.length;var strVars = cStr.substring(i1,i2);var i1 = (strVars.indexOf("=") + 1);var i2 = strVars.length;var strVars = strVars.substring(i1,i2);strVars = unescape(strVars);} else {var strVars = "";}return strVars;};' +
	'setCookie = function(cName,val) {var today = new Date().valueOf();var t = new Date(today+14*86400000);document.cookie = cName + "=" + escape(val) + "; expires=" + t + "; domain=\\"kingdomofloathing.com\\"";};' +
	'setCookieVar = function(cName,arg,val) {var strC = document.cookie;var s = cName + "=";var g1 = strC.indexOf("; " + s);if (g1 == -1) {g1 = strC.indexOf(s);if (g1 != 0) strC = "";} else {g1 += 2;}var g2 = document.cookie.indexOf(";", g1);if (g2 == -1) g2 = strC.length;strC = unescape(strC.substring(g1 + s.length, g2));var i1 = strC.indexOf(arg+"=");if (i1 != -1) {i1 += arg.length+1;var i2 = strC.indexOf("&",i1);if (i2 == -1) i2 = strC.length;var strC1 = strC.substring(0,i1) + val + strC.substring(i2,strC.length);} else {strC1 = strC + (strC.length > 0 ? "&" : "") + arg + "=" + val;}setCookie(cName,strC1);};' +
'',10);

if (window.location.pathname == "/main_c.html" || window.location.pathname == "/main.html") {

	setTimeout('if (window["checkForUpdate"]) checkForUpdate("advadv","0.5","Adventure Advisor","http://kol.dashida.com/tardskolscripts_advadv.user.js");',1000);

	GM_registerMenuCommand("Tard's Adventure Advisor",function(e) { 
		setTimeout('' +
			'if (!window["isFighting"] || (window["isFighting"] && !isFighting)) var advAdvWindow = window.open("desc_item.php?tardAdvAdv","advadv","width=700,height=550,scrollbars=yes");' +
			'else alert("Sorry, you can\'t open Adventure Advisor while fighting.");' +
		'',10);
	});
	
	GM_setValue("strAdvList","");
	for (var i=0;i<26;i++) {
		GM_setValue("rat"+i,"");
	}
	setTimeout('' +
		'setCookieVar("tardFramework","ratAction","0");' +
	'',10);

// Adventure Advisor Window
// Area & Monster Information from Kittiwake -- http://kol.network-forums.com/viewtopic.php?p=1757
} else if (window.location.pathname == "/desc_item.php" && window.name == "advadv") {

	translateData = function(str) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(str, "application/xml");
		var zones = xmlDoc.getElementsByTagName("zone");
		var strJS = 'var advZones = new Array();';
		for (var i=0;i<zones.length;i++) {
			var zone = zones[i];
			var zName = (zone.getAttribute("name") ? zone.getAttribute("name") : "--");
			var zHit = (zone.getAttribute("hit") ? zone.getAttribute("hit") : "--");
			var zEvade = (zone.getAttribute("evade") ? zone.getAttribute("evade") : "--");
			strJS += 'advZones['+i+'] = {"name":"'+zName+'","hit":"'+zHit+'","evade":"'+zEvade+'"};' +
				'advZones['+i+'].mobs = new Array();\r\n';
			var mobs = zone.getElementsByTagName("mob");
			for (var j=0;j<mobs.length;j++) {
				var mName = (mobs[j].getAttribute("name") ? mobs[j].getAttribute("name") : "--");
				var mHP = (mobs[j].getAttribute("hp") ? mobs[j].getAttribute("hp") : "--");
				var mXP = (mobs[j].getAttribute("xp") ? mobs[j].getAttribute("xp") : "--");
				var mDef = (mobs[j].getAttribute("def") ? mobs[j].getAttribute("def") : "--");
				var mAtk = (mobs[j].getAttribute("atk") ? mobs[j].getAttribute("atk") : "--");
				var mHit = (mobs[j].getAttribute("hit") ? mobs[j].getAttribute("hit") : "--");
				var mEvade = (mobs[j].getAttribute("evade") ? mobs[j].getAttribute("evade") : "--");
				var mEA = (mobs[j].getAttribute("ea") ? mobs[j].getAttribute("ea") : (mobs[j].getAttribute("e") ? mobs[j].getAttribute("e") : "--"));
				var mED = (mobs[j].getAttribute("ed") ? mobs[j].getAttribute("ed") : (mobs[j].getAttribute("e") ? mobs[j].getAttribute("e") : "--"));
				strJS += 'advZones['+i+'].mobs.push({"name":"'+mName+'","hp":"'+mHP+'","xp":"'+mXP+'","def":"'+mDef+'","atk":"'+mAtk+'","hit":"'+mHit+'","evade":"'+mEvade+'","ea":"'+mEA+'","ed":"'+mED+'"});';
			}
		}
		setTimeout(strJS,10);
		setTimeout("showAdvAdvisor();",500);
	};
	var strAdvList = GM_getValue("strAdvList");
	if (strAdvList && strAdvList != "") {
		translateData(strAdvList);
	} else {
		GM_xmlhttpRequest({
		  method: 'GET',
		  url: 'http://kol.dashida.com/advlist.xml',
		  headers: {'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey','Accept': 'application/xml',},
		  onload: function(responseDetails) {
				if (responseDetails.status == "200") {
					GM_setValue("strAdvList",responseDetails.responseText);
					translateData(responseDetails.responseText);
				}
		  }
		});
	}


	document.title = "Tard's Adventure Advisor";
	var strCSS = '' +
		'body,p,form {margin:0px;padding:0px;}' +
		'h1{font-size:14px;margin:5px 0px 5px 5px;padding:0px;}' +
		'ul {margin:0px 0px 0px 10px;padding:0px;}' +
		'table{border:0px;margin:0px;padding:0px;font-size:10px;font-weight:normal;}' +
		'td,th {padding:2px;}' +
		'th {font-size:11px;font-weight:bold;text-align:left;}' +
		'table{border-collapse:collapse;}' +
		'input{font-size:11px;}' +

		'#tabNav {margin-top:2px;border-bottom:1px solid #aaa;font-size:11px;}' +
		'#tabNav ul {margin:0px 0px 0px 5px;list-style:none;height:19px;}' +
		'#tabNav li {height:19px;float:left;cursor:pointer;}' +
		'#tabNav li .tab{margin:0px 2px;padding:3px 12px;height:12px;background:#ccc;border:1px solid #aaa;font-weight:normal;}' +
		'#tabNav li.active {cursor:default;}' +
		'#tabNav li.active .tab {height:13px;background:#fff;border-bottom:0px;font-weight:bold;}' +
		'#tabNav li.blink .tab {height:13px;background:#DAAE81;border-bottom:0px;font-weight:bold;}' +

		'.menuOptions {list-style:none;}' +
		'.menuOptions select {font-size:12px;}' +
		'.menuOptions input {font-size:12px;}' +
		'.menuOptions label {padding-left:5px;}' +
		
		'#advAdvisor {padding:0px;font-size:10px;}' +
		'#advAdvisor table {width:100%;}' +
		'#advAdvisor table tr.zones {background:#ececec;cursor:pointer;}' +
		'#advAdvisor table.mobs {border:1px solid #666;}' +
		'.mobs td,.mobs th {padding:5px 10px 5px 5px;}' +

		'.advAdv {list-style:none;margin:0px;}' +
		'.advAdv li {float:left;margin-right:10px;}' +

		'.tabContainer{display:none;font-size:12px;padding:10px;}' +
		'#advadvContainer{display:block;}' +

	'';
	GM_addStyle(strCSS);
	
	var bodyTag = document.getElementsByTagName("body")[0];
	bodyTag.innerHTML = '' +
		'<h1>Tard\'s Adventure Advisor</h1>' +
		'<div id="tabNav">' +
			'<ul class="clearfix">' +
				'<li id="advadvTab" class="active" onClick="setTab(\'advadv\');"><div class="tab">Adventure Advisor</div></li>' +
				'<li id="helpTab" onClick="setTab(\'help\');"><div class="tab">Help</div></li>' +
				'<li id="donateTab" onClick="setTab(\'donate\');"><div class="tab">Donate</div></li>' +
			'</ul>' +
		'</div>' +
		'<div id="advadvContainer" class="tabContainer">' +
			'<p style="margin-bottom:10px;">Choose the stat used to determine the To Hit chance.  Moxie players using ranged weapons should pick Mox.  Players with Spirit of Rigatoni using a staff weapon should pick Mys. To Hit and Be Hit values are based on raw stats and do not count any buffs or item effects you may have.</p>' +
			'<ul class="advAdv clearfix">' +
				'<li style="font-weight:bold;">Attack Stat:</li>' +
				'<li><input type="radio" name="advAdv" onclick="setCookieVar(\'tardFramework\',\'advAdvStat\',\'Mus\');window.location.reload();" ' + (getCookieVar("tardFramework","advAdvStat") == "" || getCookieVar("tardFramework","advAdvStat") == "Mus" ? "checked" : "" ) + '/>Muscle' +
				'<li><input type="radio" name="advAdv" onclick="setCookieVar(\'tardFramework\',\'advAdvStat\',\'Mys\');window.location.reload();" ' + (getCookieVar("tardFramework","advAdvStat") == "Mys" ? "checked" : "" ) + '/>Mysticality' +
				'<li><input type="radio" name="advAdv" onclick="setCookieVar(\'tardFramework\',\'advAdvStat\',\'Mox\');window.location.reload();" ' + (getCookieVar("tardFramework","advAdvStat") == "Mox" ? "checked" : "" ) + '/>Moxie' +
				'<li style="float:right;text-align:right;"><span style="font-weight:bold;">Current MCD Level:</span> &#160;<input id="MCDLevel" type="text" value="0" style="width:25px;" readonly /><br/><span style="font-weight:bold;">Monster Level Modifier:</span> &#160;<input id="MLMod" type="text" value="0" style="width:25px;" /><input type="button" value="set" onclick="showAdvAdvisor();" style="margin-left:5px;width:35px;height:20px;" /></li>' +
			'</ul><br/><br/>' +
			'<div id="advAdvisor"><span style="font-size:13px;">Loading...</span></div>' +
			'<div style="padding-top:10px;">Data from <a href="http://kol.network-forums.com/viewtopic.php?p=1757" target="_new">Kittiwake\'s Monster Survival Guide</a></div>' +
		'</div>' +
		'<div id="helpContainer" class="tabContainer">' +
			'If you\'re experiencing technical difficulties with any of my scripts, please check the following:<br/>' +
			'<ol>' +
				'<li>Go to <a href="http://kol.dashida.com" target="_new">my site</a> and check the Known Issues/Bugs tab.</li>' +
				'<li>Visit the <a href="http://forums.kingdomofloathing.com/viewtopic.php?t=41861" target="_new">Tard\'s Greasemonkey scripts for KoL</a> thread.</li>' +
			'</ol>' +
			'If the issue or bug you\'re experiencing is not listed above, please report it in the <a href="http://forums.kingdomofloathing.com/viewtopic.php?t=41861" target="_new">Tard\'s Greasemonkey scripts for KoL</a> thread ' +
			'or send me a <a href="#" onclick="window.opener.setTab(\'msg\',\'sendmessage.php?toid=22680\');return false;">KMail</a>.' +
		'</div>' +
		'<div id="donateContainer" class="tabContainer">' +
			'If you like my scripts, you can send me a <a href="#" onclick="window.opener.setTab(\'store\',\'town_sendgift.php?towho=22680\');return false;">token</a> of your appreciation.' +
		'</div>' +
	'';

	setTimeout('' +
		'var ML = 0;' +
		'var isFighting = false;' +
		'var currentTab = "advadv";' +
		'setTab = function(tab) {' +
			'if (currentTab != tab) {' +
				'if (!isFighting) {' +
					'tabFrame = document.getElementById(tab+"pane");' +
					'if (tabFrame && tabFrame.src) {' +
						'pane = eval(tab+"pane");' +
						'pane.location.href = pane.location.href;' +
					'}' +
					'document.getElementById(currentTab+"Container").style.display = "none";' +
					'document.getElementById(currentTab+"Tab").className = "";' +
					'document.getElementById(tab+"Container").style.display = "block";' +
					'document.getElementById(tab+"Tab").className = "active";' +
					'currentTab = tab;' +
				'} else {' +
					'alert("You\'re currently fighting.");' +
				'}' +
			'}' +
		'};' +
	'',10);

	// Adventure Advisor
	setTimeout('' +
		'showAdvAdvisor = function() {' +
			'getCHit = function(m) {' +
				'var p = addML(m.hit);' +
				'if (isNaN(p)) var c = m.hit;' +
				'else if (sStat >= p) var c = "100%";' +
				'else if (p - sStat > 18) var c = "0%";' +
				'else var c = Math.round(((sStat-p)*(100/18)+100)) + "%";' +
				'return c;' +
			'};' +
			'getCEvade = function(m) {' +
				'var p = addML(m.evade);' +
				'if (isNaN(p)) var c = m.evade;' +
				'else if (sMox >= p) var c = "100%";' +
				'else if (p - sMox > 18) var c = "0%";' +
				'else var c = Math.round(((sMox-p)*(100/18)+100)) + "%";' +
				'return c;' +
			'};' +
			'sortEvade = function(a,b) {' +
				'return (Number(a.evade) > Number(b.evade) ? -1 : 1);' +
			'};' +
			'addML = function(n,m) {' +
				'if (isNaN(n)) return n;' +
				'else return Math.round((Number(n) + Number(ML)*(m ? m : 1))*100)/100;' +
			'};' +
			'advZones.sort(sortEvade);' +
			'var strHTML = window.opener.frames[1].document.getElementsByTagName("body")[0].innerHTML;' +
			'var useStat = getCookieVar("tardFramework","advAdvStat");' +
			'if (useStat == "") useStat = "Mus";' +
			'var i1 = strHTML.indexOf(">"+useStat);' +
			'var i2 = strHTML.indexOf("</tr>",i1);' +
			'var sStat = strHTML.substring(i1,i2).match(/\\d+/)[0];' +
			'i1 = strHTML.indexOf(">Mox");' +
			'i2 = strHTML.indexOf("</tr>",i1);' +
			'var sMox = strHTML.substring(i1,i2).match(/\\d+/)[0];' +
			'var i1 = strHTML.indexOf("canadia.php?place=machine");' +
			'var MCDLevel = 0;' +
			'var MLMod = 0;' +
			'if (i1 != -1) {' +
				'var i2 = strHTML.indexOf("<b>",i1);' +
				'var i3 = strHTML.indexOf("</b>",i2);' +
				'MCDLevel = Number(strHTML.substring(i2+3,i3));' +
				'document.getElementById("MCDLevel").value = MCDLevel;' +
			'}' +
			'var ml = document.getElementById("MLMod").value;' +
			'if (ml && ml != "" && !isNaN(ml)) MLMod = Number(ml);' +
			'document.getElementById("MLMod").value = MLMod;' +
			'ML = Number(MLMod) + Number(MCDLevel);' +
			'var strDiv = "<p style=\\"font-weight:bold;font-size:11px;\\">Your Attack ("+useStat+") is " + sStat + "</p>";' +
			'strDiv += "<p style=\\"font-weight:bold;font-size:11px;margin-bottom:10px;\\">Your Defense is " + sMox + "</p>";' +
			'strDiv += "<table><thead><tr><th>Location</th><th>Safe Hit</th><th>Safe Evade</th><th>% to Hit</th><th>% to Evade</th></tr></thead><tbody>";' +
			'for (var i=0;i<advZones.length;i++) {' +
				'var zName = advZones[i].name;' +
				'var zHit = addML(advZones[i].hit);' +
				'var zEvade = addML(advZones[i].evade);' +
				'strDiv += "<tr class=zones onclick=\\"toggleMobs("+i+");\\"><td>" + zName + "</td><td>" + zHit + "</td><td>" + zEvade + "</td><td>" + getCHit(advZones[i]) + "</td><td>" + getCEvade(advZones[i]) + "</td></tr>";' +
				'strDiv += "<tr><td colspan=5><table class=mobs id=\\"mobs"+i+"\\" style=\\"display:none;\\"><thead><tr><th>Name</th><th>HP</th><th>XP</th><th>Def</th><th>Atk</th><th>Hit</th><th>Evade</th><th>% To Hit</th><th>% To Evade</th><th>E Atk</th><th>E Def</th></tr></thead><tbody>";' +
				'for (var j=0;j<advZones[i].mobs.length;j++) {' +
					'var mob = advZones[i].mobs[j];' +
					'var mHP = addML(mob.hp);' +
					'var mXP = addML(mob.xp,.2);' +
					'var mDef = addML(mob.def);' +
					'var mAtk = addML(mob.atk);' +
					'var mHit = addML(mob.hit);' +
					'var mEvade = addML(mob.evade);' +
					'strDiv += "<tr><td>" + mob.name + "</td><td>" + mHP + "</td><td>" + mXP + "</td><td>" + mDef + "</td><td>" + mAtk + "</td><td>" + mHit + "</td><td>" + mEvade + "</td><td>" + getCHit(mob) + "</td><td>" + getCEvade(mob) + "</td><td>" + mob.ea + "</td><td>" + mob.ed + "</td></tr>";' +
				'}' +
				'strDiv += "</tbody></table>";' +
			'}' +
			'strDiv += "</tbody></table>";' +
			'advAdvDiv = document.getElementById("advAdvisor");' +
			'advAdvDiv.innerHTML = strDiv;' +
		'};' +
		'toggleMobs = function(i) {' +
			'var e = document.getElementById("mobs"+i);' +
			'var strDisplay = (e.style.display == "none" ? "block" : "none");' +
			'e.style.display = strDisplay;' +
		'};' +
	'',10);

// Typical Tavern Helper
} else if (window.location.pathname == "/rats.php") {
	var strCSS = '' +
		'.block{width:100px;height:100px;background-image:url(http://images.kingdomofloathing.com/otherimages/woods/ratdark3.gif);font-size:11px;}' +
		'.explored{background:#fff;width:76px;height:76px;padding:10px;border:1px dotted #000;margin:1px;}' +
		'.last_explored{background:#fff;width:76px;height:76px;padding:10px;border:2px solid #f00;margin:1px;}' +
	'';
	GM_addStyle(strCSS);
	
	var aA = document.getElementsByTagName("a");
	var strHTML = document.getElementsByTagName("body")[0].innerHTML;
	if (strHTML.indexOf("rat faucet") != -1) {
		var j = window.location.search.substr(7);
		GM_setValue("rat"+j,"faucet");
		GM_setValue("lastrat",n);
	} else if (strHTML.indexOf("You acquire an item") != -1) {
		var j = window.location.search.substr(7);
		GM_setValue("rat"+j,"item");
		GM_setValue("lastrat",n);
	}
	setTimeout('var aA = document.getElementsByTagName("a");',10);
	var n = 1;
	for (var i=0;i<aA.length;i++) {
		if (aA[i].href.indexOf("rats.php?where=") != -1) {
			setTimeout('aA['+i+'].onclick = function() {setCookieVar("tardFramework","ratAction",'+n+');};',10);
			var strTxt = "";
			if (GM_getValue("rat"+n) == "rat"){
				strTxt = "Rat (1)";
			} else if (GM_getValue("rat"+n) == "faucet"){
				strTxt = "Rat Faucet";
			} else if (GM_getValue("rat"+n) == "item"){
				strTxt = "Item (1)";
			} else if (GM_getValue("rat"+n) == "baron"){
				strTxt = "Baron Von Ratsworth (1)";
			}
			var classstr = (strTxt != "" ? " explored" : "");
//alert('Last: ' + GM_getValue('lastrat'));
			if (GM_getValue("lastrat") == n) { classstr = " last_explored"; }
			var strBlock = '<div id="r'+(n)+'" class="block' + classstr + '">' + strTxt + '</div>';
			aA[i].innerHTML = strBlock;
			n++;
		}
	}

// Fight 
} else if (window.location.pathname == "/fight.php") {
	var monName = document.getElementById("monname");
	switch(monName.innerHTML) {
		case "a drunken rat":
			if (document.referrer.indexOf("rats.php") != -1) {
				var n = getCookieVar("tardFramework","ratAction");
				GM_setValue("rat"+n,"rat");
				GM_setValue("lastrat",n);
			}
		break;
		case "Baron Von Ratsworth":
			if (document.referrer.indexOf("rats.php") != -1) {
				var n = getCookieVar("tardFramework","ratAction");
				GM_setValue("rat"+n,"baron");
				GM_setValue("lastrat",n);
			}
		break;
	}
}
