const { app, BrowserWindow } = require('electron');

try {if (require('electron-squirrel-startup')) return app.quit();} catch {}

function createWindow () {
    const win = new BrowserWindow({
        width: 1100,
        height: 680,
        nodeIntegration: true,
        webPreferences: {
            webSecurity: false
        }
    })
  
    win.loadFile('index.html') 
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
