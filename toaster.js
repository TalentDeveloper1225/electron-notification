var electron = require('electron');
var BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.

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
Toaster.prototype.showToaster = function(mainWindow, msg){
    var width = 400;
    var height = 0;
    if(messageWindow === null){
        messageWindow = new BrowserWindow({
            parent: mainWindow,    
            width: width,
            height: height,    
            icon: trayImage,
            transparent: false,
            autoHideMenuBar: false,
            frame: false,        
            show : false,
            "skip-taskbar": true,
            "always-on-top": true
        });
        //messageWindow.webContents.openDevTools();
        messageWindow.setResizable(true);
        messageWindow.setMenu(null);
        messageWindow.loadURL('file://' + __dirname + '/toaster.html');        
    }

    messageWindow.on('closed', function(){
        messageWindow = null;
    })

    var str ='<div class = "focus-message" tabindex ="1" style = "padding:25px;">'
            +'<table border="0" cellpadding="0" cellspacing="0" style = "width: 100%"><tbody>'
            +'<tr><td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement);" width="80" cellpadding="0" >'
            +   '<div style="text-align:center;">'
            +       '<div> <img src="http://dentalintel.com/email_sig/di_small.png" height="40"></div>'
            +   '</div>'
            +   '</td>'
            +   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement);" cellpadding="30" style="padding: 15px 0">'
            +       '<div>'
            +           '<span id="message" style="    color: #344750;font-weight: bold;font-family: sans-serif; font-size:16px;">'+ msg.message.replace(/'/g, "\\'") + '</span><br>'
            +           '<span id="title" style="    font-family: sans-serif;color: #8ca4b0;font-size: 15px;">'+ msg.title.replace(/'/g, "\\'") + '</span>'
            +           '<span id="detail">'+ msg.detail.replace(/'/g, "\\'") + '</span>'
            +       '</div>'
            +   '</td>'
            +'</tr>';
    if(msg.type == 0){
        str+='<tr>'    
            +   '<td onclick = "removeMessage(this.parentElement.parentElement.parentElement.parentElement);" colspan="2" cellpadding="0" id="dismissbtn">'
            +       '<div style="background-color: #8a9eaa;width: 100%;text-align: center;color: #fff;font-family: sans-serif;font-size: 13px;padding-top: 5px;padding-bottom: 5px;">'
            +           '<i class="fa fa-ban" aria-hidden="true"></i>Dismiss'
            +       '</div>'
            +   '</td>'
            +'</tr>';
        }
    else if(msg.type == 1){
        str+='<tr>'
            +   '<td>'
            +       '<button>Ok</button>'
            +       '<button>Cancel</button>'
            +   '</td>'
            +'</tr>';
        }
    else if(msg.type ==2){
        str+='<tr>'
            +   '<td>'
            +       '<button>Ok</button>'
            +       '<button>Cancel</button>'
            +   '</td>'
            +'</tr>';
        }
        str+='</tbody></table>'
            +'</div>';

    messageWindow.webContents.executeJavaScript('              \
        $("#main_box .focus-message").removeAttr("tabindex");  \
        $("#main_box").prepend(\''+ str + '\');                \
        autoSetPosSize();                                      \
        $("#main_box .focus-message:first-child").focus();     \
        setTimeout(function(){var curmessage = $("#main_box .focus-message:last-child");removeMessage(curmessage);},'+ msg.timeout + ');');
    

    messageWindow.webContents.on('did-finish-load', function(){    
    	messageWindow.setPosition(electron.screen.getPrimaryDisplay().workAreaSize.width - width, electron.screen.getPrimaryDisplay().workAreaSize.height - height - 5); 
        messageWindow.show();
    });
}

module.exports = Toaster;