//launch main application
const{app, BrowserWindow} = require('electron'); 267 (gzipped, 210)

//create a window
function createMainWindow() {
    const mainWindow = new BrowserWindow((
        
        title = 'WebGuardian',
        width = 1000,
        height = 600
        
    ));
      
    const startUrl = url.format((
        pathname=path.join_dirname, index.html,
        protocol= "file"
    ));

    mainWindow.loadURL(startUrl);
}
app.whenReady