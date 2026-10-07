const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// 👇 Флаги, которые спасают от черного экрана и проблем с GPU
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.disableHardwareAcceleration(); // страховка для слабых ПК

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    show: false, // покажем после загрузки
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // 👈 важно для локальных файлов игры
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'www', 'index.html'));

  // Показываем окно только когда всё прогрузилось
  win.once('ready-to-show', () => {
    win.show();
  });

  // Ловим ошибки в консоль (чтобы видеть, если что-то падает)
  win.webContents.on('console-message', (event, level, message) => {
    console.log('[GAME]', message);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
