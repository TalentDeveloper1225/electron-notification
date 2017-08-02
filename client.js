const ipc = require('electron').ipcRenderer;

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (pair[0] === variable) {
			return decodeURIComponent(pair[1]);
		}
	}
}

/**
 * Reply app that user clicked or notification is closing
 * @param {*} isAuto - true is timeout ended. false if user interacted
 */
function replyApp(evt){
	ipc.send('toaster-reply', evt, getQueryVariable("callback"));
}

var autoSize = function() {
	var heightOffset = window.outerHeight - window.innerHeight;
	var widthOffset = window.outerWidth - window.innerWidth;
	var result = {
		height : document.getElementById("content").clientHeight + heightOffset,
		width : document.getElementById("content").clientWidth + widthOffset
	}

	window.resizeTo(result.width, result.height);

	return result;
};


var onLoad = function load(/*event*/){
	autoSize();
    this.removeEventListener("load", load, false); //remove listener, no longer needed

	// this.setTimeout(function() {
	// 	replyApp(1);
	// 	this.close();
	// }, parseInt(getQueryVariable("timeout")));

	document.addEventListener("click", ()=>{
		replyApp(0)
		this.close();
	});
	
	document.addEventListener("goaway", ()=>{
		this.close();
	});	
};

document.getElementById("title").innerHTML = getQueryVariable("title");
document.getElementById("message").innerHTML = getQueryVariable("message");
//document.getElementById("detail").innerHTML = getQueryVariable("detail");
window.addEventListener("load", onLoad, false);

document.getElementById("dismissbtn").addEventListener("click", (evt)=>{
	
		if (evt.stopPropagation) {
			evt.stopPropagation();
		} else {
			evt.cancelBubble = true;
		}		
		replyApp(2)
		var event = new CustomEvent("goaway", { "detail": "" });
		document.dispatchEvent(event);
	});

