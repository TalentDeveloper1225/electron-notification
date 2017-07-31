const electron = require('electron');
const Toaster = require('./toaster.js');
const path = require('path');
const Store = require('./store.js');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const autoUpdater = require("electron-updater").autoUpdater;

/*********************************/
// Some magic for correct image processing on Tray and other stuff 
/*********************************/
var trayImage;
var imageFolder = __dirname + '/assets/images';
var tray = null;

// Determine appropriate icon for platform
if (process.platform == 'darwin') {
    trayImage = imageFolder + '/di-logo-32x32.png';
} else { // fallback , if (process.platform == 'win32')
    trayImage = imageFolder + '/favicon.ico';
}

var mainWindow = null;
var toasterObj = null;

/*********************************/
//Initialize App Setting Info.
/*********************************/
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'Setting_information',
  defaults: {
    // 800x600 is the default size of our window
    messageNotificationTime: 5000
  }
});

var messageNotificationTime = 120000;
/*********************************/
//Quit all windows are closed.
/*********************************/
app.on('window-all-closed', function(){
	if(process.platform != 'darwin'){
		app.quit();
	}
});

/*********************************/
//initialization and is ready to create browser windows.
/*********************************/
app.on('ready', function () {
    
    //Get the setting information
    messageNotificationTime = store.get('messageNotificationTime');

    // Create the browser mainWindow.
    mainWindow = new BrowserWindow({
        icon: trayImage,
    });
    
    mainWindow.maximize();
    
    tray = new electron.Tray(trayImage);
    
    //create user menu

    const template = [
        {
            label: 'Settings',
            submenu: [
              {role: 'reload'},
              {
                label: 'Back',
                click () { if( mainWindow.webContents.canGoBack() ){mainWindow.webContents.goBack();} }
              }
            ]
        },
        {
            role: 'help',
            submenu: [
              {
                label: 'Dental Intel Community',
                click () { require('electron').shell.openExternal('https://community.dentalintel.com') }
              }
            ]
        }
    ]
    template[0].submenu.push({
        label: 'Screen Pop',
        click: (menuItem, browserWindow, event) => {
            var timeframe = new BrowserWindow({
                parent: mainWindow,
                width:500,
                height:200,
                icon: trayImage,
                frame: false,
                "always-on-top": true
            });
            timeframe.setResizable(true);
            timeframe.setMenu(null);
            timeframe.loadURL('file://' + __dirname + '/timeframe.html');
            timeframe.webContents.openDevTools();
            timeframe.show();
        }
    })

    const contextMenu = electron.Menu.buildFromTemplate(template);    
    tray.setToolTip('DentalIntel Portal');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? (mainWindow.isMaximized()? mainWindow.minimize() : mainWindow.maximize()): mainWindow.show();
    })

    electron.Menu.setApplicationMenu(contextMenu);

    //load the index.html of the app
    mainWindow.loadURL('file://' + __dirname + '/splash-screen.html');

    //open the devTools
    mainWindow.webContents.openDevTools();

    //Emitted when the window is closed
    mainWindow.on('closed', function(){        
    	mainWindow = null;
    });   

    //Create Toaster
    toasterObj = new Toaster();
    toasterObj.initializeToaster(mainWindow);
});


/*******************************/
//Set Display Message Time
/*******************************/

ipc.on('setDiplayMessageTime', (event, data)=>{
  messageNotificationTime = data * 1000;  
  store.set('messageNotificationTime', messageNotificationTime);
})

/*******************************/
//Notification by clicking button
/********************************/
ipc.on('send-message', (event, data) =>{
  mainWindow.minimize();  
  setTimeout(function(){
    var title = (typeof data.title !== "undefined") ? data.title : "";
    var message = (typeof data.message !== "undefined") ? data.message : "";
    var detail = (typeof data.detail !== "undefined") ? data.detail : "";
    var type = (typeof data.type !== "undefined") ? data.type : 0;
    var callback = (typeof data.callback !== "undefined") ? data.callback : null;
    
    var msg = { 
        title : title, 
        message : message, 
        detail : detail,
        timeout: messageNotificationTime,
        type: type,
        callback: callback
    }; 
    
    toasterObj.showToaster(msg);
  },5000);
  
})

//Initialise autoUpdate
var statue_autoUpdating = false; 

autoUpdater.on('update-available', () => {
  if(statue_autoUpdating == true){
    
    var str ='<div class ="Notification" style = "border:1px solid black; padding: 5px; display: block;">'
          +  '<table>'
          +   '<tbody>'
          +    '<tr>'
          +     '<td>'
          +      'Do you update new version ..?'  
          +     '</td>'
          +     '<td>'
          +      '<div>'
          +       ok
          +      '</div>'            
          +     '</td>'
          +     '<td>'
          +      '<div onclick = "$("#Notification-container .Notification").remove();">'
          +       cancel
          +      '</div>'
          +     '</td>'
          +    '</tr>'
          +   '</tbody>'
          +  '</table>'
          +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'") + '\');');
  }
});
autoUpdater.on('update-not-available', () => {
  if(statue_autoUpdating == true){
    var str ='<div class ="Notification" onclick = "this.remove();" style = "border:1px solid black; padding: 5px; display: block;">'
          +  '<table>'
          +   '<tbody>'
          +    '<tr>'
          +     '<td>'
          +      'New version doesn\'t exist.'  
          +     '</td>'
          +    '</tr>'
          +   '</tbody>'
          +  '</table>'
          +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'") + '\');  \
      setTimeout(function(){$("#Notification-container .Notification").remove();}, 3000);');
    statue_autoUpdating = false;
  }
});

autoUpdater.on('error', () => {
  if(statue_autoUpdating == true){
    var str ='<div class ="Notification" onclick = "this.remove();" style = "border:1px solid black; padding: 5px; display: block;">'
          +  '<table>'
          +   '<tbody>'
          +    '<tr>'
          +     '<td>'
          +      'Error in autoUpdating.'  
          +     '</td>'
          +    '</tr>'
          +   '</tbody>'
          +  '</table>'
          +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'")  + '\');  \
      setTimeout(function(){$("#Notification-container .Notification").remove();}, 3000);');
    statue_autoUpdating = false;
  }
});

autoUpdater.on('download-progress', () => {
  if(statue_autoUpdating == true){
    var str ='<div class ="Notification" style = "border:1px solid black; padding: 5px; display: block;">'
          +  '<table>'
          +   '<tbody>'
          +    '<tr>'
          +     '<td>'
          +      'Download progress...'  
          +     '</td>'
          +    '</tr>'
          +   '</tbody>'
          +  '</table>'
          +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'")  + '\');');    
  }
});

autoUpdater.on('update-downloaded', () => {
  if(statue_autoUpdating == true){
    var str ='<div class ="Notification" style = "border:1px solid black; padding: 5px; display: block;">'
          +  '<table>'
          +   '<tbody>'
          +    '<tr>'
          +     '<td>'
          +      'Update downloaded; will install in 5 seconds'  
          +     '</td>'
          +    '</tr>'
          +   '</tbody>'
          +  '</table>'
          +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'")  + '\');');
    setTimeout(function() {
    autoUpdater.quitAndInstall();  
    }, 5000);
  }
});

/*******************************/
//Start autoUpdate
/********************************/
ipc.on('start-autoUpdate', (event) =>{
    
    autoUpdater.setFeedURL('http://localhost:9000/dist/win/');

    autoUpdater.checkForUpdates();
    statue_autoUpdating = true;
    
    var str ='<div class ="Notification" style = "border:1px solid black; padding: 5px; display: block;">'
            +   '<table>'
            +     '<tbody>'
            +       '<tr>'
            +         '<td>'
            +          'Checking for new version.........'  
            +         '</td>'
            +       '</tr>'
            +     '</tbody>'
            +   '</table>'
            +'</div>'
    mainWindow.webContents.executeJavaScript('              \
      $("#Notification-container .Notification").remove();  \
      $("#Notification-container").append(\''+ str.replace(/'/g, "\\'") + '\');');
})

//Listen to liku.
ipc.on('toaster-reply', (event, data, callback_id) => {
  
  switch(callback_id){
    case 0:               
      mainWindow.webContents.executeJavaScript('\
        console.log("The Toast is clicked.");');
      break;
    case 1:
      mainWindow.webContents.executeJavaScript('\
        console.log("The Toast Timed out.");');     
      break;
    case 2:
      mainWindow.webContents.executeJavaScript('\
        console.log("The Toast is dismissed.");');
      break;
  }
});