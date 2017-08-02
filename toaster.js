var electron = require('electron');
var BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;

var trayImage;
var imageFolder = __dirname + '/assets/images';

// Determine appropriate icon for platform
if (process.platform == 'darwin') {
    trayImage = imageFolder + '/di-logo-32x32.png';
} else { 
    trayImage = imageFolder + '/favicon.ico';
}

var Toaster = function(){
	return this;
};

var messageWindow = null;

//Create the message window
Toaster.prototype.initializeToaster = function(mainWindow){
	var width = 400;
    var height = 1000;
	
	messageWindow = new BrowserWindow({
		width: width,
		height: height,    
		icon: trayImage,
		frame: false,        
		show : false,
		alwaysOnTop: true,
		skipTaskbar: true
	});
	//messageWindow.webContents.openDevTools();
	//messageWindow.setResizable(true);
	messageWindow.setResizable(false);
	messageWindow.setMenu(null);
	messageWindow.loadURL('file://' + __dirname + '/toaster.html');        
	
	
	messageWindow.on('close', (event) => {
		event.preventDefault();
        messageWindow.hide();
	})		

	messageWindow.webContents.on('did-finish-load', function(){    
		messageWindow.setPosition(electron.screen.getPrimaryDisplay().workAreaSize.width - width, electron.screen.getPrimaryDisplay().workAreaSize.height - height - 5); 
	});

}

Toaster.prototype.showToaster = function(msg){
	var callback = msg.callback;	
	console.log("showToaster for callback: " + callback);
    var str ='<div class = "focus-message" tabindex ="1" style = "margin: 5px; border-radius: 15px;background-color: white;" callback="' + callback + '">'
            +'<table border="0" cellpadding="0" cellspacing="0" style = "width: 100%"><tbody>'
            +'<tr><td width="80" cellpadding="0" >'
            +   '<div style="text-align:center;">';
    if(callback == null){
        str+=       '<div> <img src="assets/images/di_question.png" height="40"></div>';
    }
    else{
        str+=       '<div> <img src="http://dentalintel.com/email_sig/di_small.png" height="40"></div>';
    }
        str+=   '</div>'
            +   '</td>'
            +   '<td cellpadding="30" style="padding: 15px 0">'
            +       '<div>'
            +           '<span id="title" style="    font-family: sans-serif;color: black;font-weight:bold;font-size: 15px;">'+ msg.title.replace(/'/g, "\\'") + '</span><br>';

    if(callback == null){
        str+=           '<span id="message" style="    color: #6e7a89;font-family: sans-serif; font-size:15px;">'+ msg.message.replace(/'/g, "\\'") + '</span><br>';
    }
    else{
        str+=           ((msg.unscheduledtx)?'<button type="button" class="btn-success btn-circle">Tx</button>':'')
            +           ((msg.pastdue)?'<button type="button" class="btn-danger btn-circle">s</button>':'')
            +           ((msg.newpatient)?'<button type="button" class="btn-primary btn-circle">NP</button>':'')
            +           ((msg.birthday)?'<button type="button" class="btn-warning btn-circle"><i class="fa fa-birthday-cake" aria-hidden="true"></i></button>':'')
    }
        str+=       '</div>'
            +   '</td>'
            +   '<td>'
            +   '</td>'
            +'</tr>'
            +'</tbody>'
            +'</table>'
            +'<table border="0" cellpadding="0" cellspacing="0" style = "width: 100%"><tbody>'
            +'<tr>';
    if(callback == null){    
        str+=   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement,false);" cellpadding="0" id="dismissbtn" >'
            +       '<div style="background-color: #8a9ea8;width: 100%;text-align: center;color: #f1f5fd;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px; border-bottom-left-radius: 10px;">'
            +           '<i class="fa fa-ban" aria-hidden="true" style = "padding-right:5px;"></i>Dismiss'
            +       '</div>'
            +   '</td>'
            +   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement,false);" cellpadding="0" id="patientbtn">'
            +       '<div style="background-color: #7dcc54;width: 100%;text-align: center;color: #f1f5fd;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px;">'
            +           '<i class="fa fa-user-circle-o" aria-hidden="true" style = "padding-right:5px;"></i>Patient'
            +       '</div>'
            +   '</td>'
            +   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement,false);" cellpadding="0" id="prospectbtn">'
            +       '<div style="background-color: #1379ea;width: 100%;text-align: center;color: #f1f5fd;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px;border-bottom-right-radius: 10px;">'
            +           '<i class="fa fa-user-plus" aria-hidden="true" style = "padding-right:5px;"></i>Prospect'
            +       '</div>'
            +   '</td>';
    }
    else{
        str+=   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement,false);" cellpadding="0" id="dismissbtn" style = "width: 50%;">'
            +       '<div style="background-color: #8a9ea8;width: 100%;text-align: center;color: #f1f5fd;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px;border-bottom-left-radius: 10px;">'
            +           '<i class="fa fa-ban" aria-hidden="true" style = "padding-right:5px;"></i>Dismiss'
            +       '</div>'
            +   '</td>'
            +   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement,false);" cellpadding="0" id="viewPatientbtn">'
            +       '<div style="background-color: #7dcc54;width: 100%;text-align: center;color: #f1f5fd;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px;border-bottom-right-radius: 10px;">'
            +           '<i class="fa fa-user-circle-o" aria-hidden="true" style = "padding-right:5px;"></i>View Patient'
            +       '</div>'
            +   '</td>';            
    }
        str+='</tr>'
            +'</tbody></table>'
            +'</div>';

    messageWindow.webContents.executeJavaScript('              \
        $("#main_box .focus-message").removeAttr("tabindex");  \
        $("#main_box").prepend(\''+ str + '\');                \
        autoSetPosSize();                                      \
        setTimeout(function(){var curmessage = $("#main_box .focus-message:last-child");removeMessage(curmessage,null);},'+ msg.timeout + ');');
		
    	
	messageWindow.show();
}

module.exports = Toaster;