const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');

// НЕ отключаем GPU — Three.js без него лагает.
// Флаги ниже наоборот помогают включить GPU даже на слабых/старых картах.
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    fullscreen: false,          // 👈 оконный режим — есть панель с крестиком
    autoHideMenuBar: false,     // 👈 меню видно (Файл → Выход)
    backgroundColor: '#000000',
    show: false,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      backgroundThrottling: false  // 👈 не тормозит когда не в фокусе
    }
  });

  // Оставляем меню, но убираем всё лишнее, оставляем только базовое (с "Выход")
  const template = [
    {
      label: 'Игра',
      submenu: [
        {
          label: 'Полный экран (F11)',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Выход' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload', label: 'Перезагрузить' },
        { role: 'forceReload', label: 'Жёсткая перезагрузка' },
        { role: 'toggleDevTools', label: 'Консоль разработчика' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Обычный масштаб' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полный экран' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  mainWindow.loadFile(path.join(__dirname, 'www', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  // F11 через глобальный шорткат — на случай, если меню не сработает
  globalShortcut.register('F11', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // Esc сам по себе НЕ закрывает (в игре он на паузу), Alt+F4 и крестик работают
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
