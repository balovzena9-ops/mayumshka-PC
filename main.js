const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

Menu.setApplicationMenu(null);

app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

// Файл лога для отладки — рядом с .exe
const LOG_PATH = path.join(app.getPath('userData'), 'mayumshka_log.txt');
function log(msg){
  try { fs.appendFileSync(LOG_PATH, '[' + new Date().toISOString() + '] ' + msg + '\n'); } catch(e){}
}
try { fs.writeFileSync(LOG_PATH, '=== MayUmshka log ===\n'); } catch(e){}

function createWindow() {
  // Проверяем, что three.min.js попал в сборку
  const threePath = path.join(__dirname, 'three.min.js');
  const threeExists = fs.existsSync(threePath);
  const threeSize = threeExists ? fs.statSync(threePath).size : 0;
  const indexPath = path.join(__dirname, 'index.html');
  const indexExists = fs.existsSync(indexPath);
  const indexSize = indexExists ? fs.statSync(indexPath).size : 0;

  log('__dirname: ' + __dirname);
  log('index.html exists: ' + indexExists + ', size: ' + indexSize);
  log('three.min.js exists: ' + threeExists + ', size: ' + threeSize);

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
      webSecurity: false,
      sandbox: false,
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  win.loadFile('index.html');

  // === Автоматически открываем DevTools в отдельном окне ===
  win.webContents.openDevTools({ mode: 'detach' });

  // Логи из renderer
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const line1 = '[RENDERER L' + level + '] ' + message + ' (' + sourceId + ':' + line + ')';
    console.log(line1);
    log(line1);
  });

  win.webContents.on('did-fail-load', (e, code, desc, failedUrl) => {
    const line1 = '[LOAD FAIL] ' + code + ' ' + desc + ' ' + failedUrl;
    console.error(line1);
    log(line1);
  });

  win.webContents.on('render-process-gone', (e, details) => {
    const line1 = '[RENDERER GONE] ' + JSON.stringify(details);
    console.error(line1);
    log(line1);
  });

  win.webContents.on('did-finish-load', () => {
    log('Page did-finish-load OK');
    // Проверяем, определён ли THREE в renderer
    win.webContents.executeJavaScript('typeof THREE')
      .then(res => { log('THREE in renderer: ' + res); })
      .catch(err => { log('THREE check error: ' + err); });
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
