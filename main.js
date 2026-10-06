const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

Menu.setApplicationMenu(null);

// Регистрируем схему app:// как привилегированную (с WebGL, fetch, CORS)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

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
      webSecurity: true,                // ← безопасность включена
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  // Все файлы из корня проекта отдаются через app://
  protocol.registerFileProtocol('app', (request, callback) => {
    let filePath = decodeURIComponent(request.url.replace('app://', ''));
    if (filePath.startsWith('/')) filePath = filePath.slice(1);
    if (!filePath) filePath = 'index.html';
    const fullPath = path.join(__dirname, filePath);
    callback({ path: fullPath });
  });

  win.loadURL('app://index.html');

  // F12 — DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  win.webContents.on('console-message', (e, level, message, line, sourceId) => {
    console.log('[RENDERER]', message, '(' + sourceId + ':' + line + ')');
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
