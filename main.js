const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

Menu.setApplicationMenu(null);

app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'MayUmshka — Завод «Баловск»',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false
    }
  });

  win.loadFile('index.html');

  // Автоматически открываем DevTools в отдельном окне
  win.webContents.openDevTools({ mode: 'detach' });

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
