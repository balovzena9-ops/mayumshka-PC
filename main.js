const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

Menu.setApplicationMenu(null);

// Форсируем WebGL и аппаратное ускорение
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.disableHardwareAcceleration = false;

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
      webSecurity: false,               // ← временно, для диагностики CDN
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  win.loadFile('index.html');

  // F12 — открыть DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Ошибки из renderer-процесса — в консоль Electron
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('[RENDERER][' + level + ']', message, '(' + sourceId + ':' + line + ')');
  });

  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error('[LOAD FAIL]', code, desc, url);
  });

  win.webContents.on('render-process-gone', (e, details) => {
    console.error('[RENDERER GONE]', details);
  });

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });
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
