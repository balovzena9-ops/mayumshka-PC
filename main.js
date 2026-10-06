const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const url = require('url');

Menu.setApplicationMenu(null);

// ===== Регистрируем протокол app:// (правильный способ, работает с .asar) =====
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: false
    }
  }
]);

// Форсируем WebGL и аппаратное ускорение
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

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
      webSecurity: true,
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  // Отдаём файлы из корня проекта через app://
  protocol.registerFileProtocol('app', (request, callback) => {
    let filePath = decodeURIComponent(request.url.replace('app://', ''));
    // Убираем возможный ведущий слэш
    if (filePath.startsWith('/')) filePath = filePath.slice(1);
    // Убираем якорь/query если есть
    const hashIdx = filePath.indexOf('#');
    if (hashIdx >= 0) filePath = filePath.slice(0, hashIdx);
    const qIdx = filePath.indexOf('?');
    if (qIdx >= 0) filePath = filePath.slice(0, qIdx);
    // Если пусто — index.html
    if (!filePath) filePath = 'index.html';

    const fullPath = path.join(__dirname, filePath);
    callback({ path: fullPath });
  });

  win.loadURL('app://index.html');

  // F12 — открыть/закрыть DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Логи из renderer — в консоль Electron (для отладки)
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('[RENDERER]', message, '(' + sourceId + ':' + line + ')');
  });

  win.webContents.on('did-fail-load', (e, code, desc, failedUrl) => {
    console.error('[LOAD FAIL]', code, desc, failedUrl);
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
