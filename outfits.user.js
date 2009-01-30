// Quick Outfits
// Original Copyright (c) 2007, Chris Moyer
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Quick Outfits
// @namespace      http://www.noblesse-oblige.org/cdmoyer/
// @include        *kingdomofloathing.com/inventory.php?*which=2*
// @include        *kingdomofloathing.com/charpane.php*
// @include        *127.0.0.1*/inventory.php?*which=2*
// @include        *127.0.0.1*/charpane.php*
// @include        *loathing2.com/inventory.php?*which=2*
// @include        *loathing2.com/charpane.php*
// @exclude	       *forums.kingdomofloathing.com*
// @description    Version 1.0
// ==/UserScript==


// ----------------------------------------------------
// // GM_GET: Stolen gleefully from OneTonTomato. Tee-hee!
// // ----------------------------------------------------
function GM_get(dest, callback)
{	GM_xmlhttpRequest({
		method: 'GET',
		url: 'http://' + dest,
				//onerror:function(error) { GM_log("GM_get Error: " + error); },
				onload:function(details) {
						if( typeof(callback)=='function' ){
								callback(details.responseText);
}	}	});	}



if (window.location.pathname == '/charpane.php') {
	var outfits = GM_getValue('outfits');
	var outfitdiv = document.createElement('div');
	outfitdiv.style.textAlign = 'center';
	if (!outfits) {
		var ainv = document.createElement('a');
		ainv.target = 'mainpane';
		ainv.href = '/inventory.php?which=2';
		ainv.innerHTML = 'Load Outfits';
		outfitdiv.appendChild(ainv);
	}
	else {
		var outfitsel = document.createElement('select');
		outfitsel.style.width='80%';
		outfitsel.setAttribute('id', 'outfitsel');
		var outfits = outfits.split(/\|\|-\|\|/);
		for (i=0; i<outfits.length; i++) {
			if (outfits[i] == '') { continue;}
			var parts = outfits[i].split(/\|-\|/);
			outfitsel.options[outfitsel.length] = new Option(parts[0], parts[1]);
			outfitdiv.appendChild(outfitsel);
		}
		outfitsel.addEventListener('change', function (ev) {
			var i = this.selectedIndex;
			var id = this.options[i].value;	
			if (id != 0 && id != '') {
				this.disabled = true;
				GM_get(document.location.host + '/inv_equip.php?action=outfit&which=2&whichoutfit='+id,
					function(r) {
						document.location = '/charpane.php?outfitsel='+id;
					});
			}
		}, false );
	}

	var as = document.getElementsByTagName("a");
	for (var i=0; i < as.length; i++) {
		var a = as[i];
		if (a.href.indexOf('charsheet.php') != -1) {
			document.body.insertBefore(outfitdiv, document.body.childNodes[1]);
		}
	}

}
else if (window.location.pathname == '/inventory.php') {
	var selects = document.getElementsByTagName('select');
	var outfits = null;
	for (var i=0; i< selects.length; i++) {
		var s = selects[i];
		if (s.name == 'whichoutfit') {
			outfits = s.options;	
		}
	}
	
	if (s.options) {
		var option_string = '';
		for (i=0; i<outfits.length; i++) {
			option_string += outfits[i].text + '|-|' + outfits[i].value + '||-||';
		}
		GM_setValue('outfits', option_string);
	}
}
