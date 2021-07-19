const { app, BrowserWindow } = require('electron');

try {if (require('electron-squirrel-startup')) return app.quit();} catch {}

function createWindow () {

    const win = new BrowserWindow({
        width: 1100,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
	    nativeWindowOpen: true,
            webSecurity: false
        }
    })

    if (app.isPackaged) {
        // workaround for missing executable argument
        process.argv.unshift(null)
    }

    if (process.env.DEV) {
        win.loadURL('http://localhost/index.html', {userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36"});
    } else {
        win.loadURL(`https://cardz-native.netlify.app/index.html`, {userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36"});
    }

    const passedFile = process.argv.slice(2)[0];
    console.log(passedFile);

    if (passedFile) {
        setTimeout(() => {
            win.webContents.send('open-file', passedFile);
        }, 500);
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
