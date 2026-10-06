const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

Menu.setApplicationMenu(null);

// ⬇️ ВАЖНО: отключаем GPU полностью
app.disableHardwareAcceleration();

// Ставим софтверный рендер WebGL (SwiftShader)
app.commandLine.appendSwitch('use-gl', 'swiftshader');
app.commandLine.appendSwitch('use-angle', 'swiftshader');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    title: 'MayUmshka — Завод «Баловск»',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  win.loadFile('index.html');   // вернуть index.html когда проверим

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  win.webContents.on('console-message', (e, level, message, line, sourceId) => {
    console.log('[RENDERER]', message, '(' + sourceId + ':' + line + ')');
  });

  win.once('ready-to-show', () => { win.show(); win.maximize(); });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
