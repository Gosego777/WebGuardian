//Gosego Otsweleng 03/05/2024
//run code --> npx nodemon --exec electron .
// Importing required modules
const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');
const {ipcMain } = require('electron');
const isDev = process.env.NODE_ENV !== 'development';

// Create a window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'WebGuardian',
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        contextIsolation: false,
        webSecurity: false,
    });
    
    mainWindow.webContents.openDevTools();
    
    // Load the index.html file
    const startUrl = url.format({
        pathname: path.join(__dirname, './guardian/index.html'), 
        protocol: 'file',
    });

    // Load index.html file into the main window
    mainWindow.loadURL(startUrl); 

}

app.whenReady().then(createMainWindow);


