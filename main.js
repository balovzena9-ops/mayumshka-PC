const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: true,       // Разрешаем изменять размер окна (кнопка станет активной!)
    maximizable: true,     // Разрешаем разворачивать на весь экран
    autoHideMenuBar: true, // Скрываем верхнюю плашку меню
    icon: path.join(__dirname, 'www', 'icon.png'), // Подгружаем иконку для окна
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Автоматически разворачиваем окно при старте
  mainWindow.maximize();

  mainWindow.loadFile(path.join(__dirname, 'www', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
