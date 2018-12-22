const { app, BrowserWindow } = require('electron');
app.on('ready', () => {
    let window = new BrowserWindow({ width: 800, height: 600 });
    window.loadURL('http://localhost:3000')
    window.webContents.openDevTools()
    window.setMenu(null)
    window.on("exit", () => {
        window = null;
    });
});