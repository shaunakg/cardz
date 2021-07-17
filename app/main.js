const { app, BrowserWindow } = require('electron');

try {if (require('electron-squirrel-startup')) return app.quit();} catch {}

function createWindow () {

    const win = new BrowserWindow({
        width: 1100,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    })

    if (app.isPackaged) {
        // workaround for missing executable argument
        process.argv.unshift(null)
    }

    win.loadFile('index.html');

    const passedFile = process.argv.slice(2)[0];
    console.log(passedFile);

    if (passedFile) {
        win.webContents.send('open-file', passedFile);
    }
    
}

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
  

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
