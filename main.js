const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Отключаем меню в верхней части окна (F10, Edit, View и т.п.)
Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    title: 'MayUmshka — Завод «Баловск»',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Нужно, чтобы requestPointerLock работал в игре
      enableBlinkFeatures: 'PointerLockOptions'
    }
  });

  win.loadFile('index.html');

  // Показываем окно только когда игра полностью загрузилась
  win.once('ready-to-show', () => {
    win.show();
    win.maximize(); // запускаем сразу развёрнутым (можно убрать)
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
