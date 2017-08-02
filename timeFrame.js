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

var TimeFrame = function(){
	return this;
};

var messageWindow = null;

//Create the message window
TimeFrame.prototype.initialize = function(mainWindow){

	messageWindow = new BrowserWindow({
		parent: mainWindow,
		width:500,
		height:200,
		icon: trayImage,
		frame: false,
		"always-on-top": true,
		show : false
	});
	messageWindow.setResizable(true);
	messageWindow.setMenu(null);
	messageWindow.loadURL('file://' + __dirname + '/timeFrame.html');
	
    messageWindow.on('close', (event) => {    	
        event.preventDefault();
        messageWindow.hide();
    })	

}

TimeFrame.prototype.showTimeFrame = function(){
	messageWindow.show();
}

module.exports = TimeFrame;