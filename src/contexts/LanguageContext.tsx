import { createContext, useContext, useState, ReactNode } from "react";

type Language = "kk" | "ru" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  kk: {
    "app.title": "S7 Робототехника",
    "app.subtitle": "Визуалды Бағдарламалау Платформасы",
    "status.label": "Күйі:",
    "status.disconnected": "Ажыратылды",
    "status.connecting": "Қосылуда...",
    "status.connected": "Қосылды",
    "menu.visual": "Визуалды Карта",
    "menu.constructor": "Робот Конструкторы",
    "menu.main": "Басты/Нейросеть",
    "menu.projects": "Менің Жобаларым",
    "projects.title": "Менің Жобаларым",
    "projects.new": "Жаңа Жоба",
    "projects.empty": "Әлі жоба жоқ",
    "projects.create": "Жаңа жоба жасау үшін жоғарыдағы батырманы басыңыз",
    "projects.delete": "Өшіру",
    "projects.open": "Ашу",
    "projects.name": "Жоба Аты",
    "projects.created": "Жасалған",
    "projects.modified": "Өзгертілген",
    "control.title": "Құрылғы Басқару",
    "control.connect": "WeDo Қосу",
    "control.disconnect": "Ажырату",
    "control.run": "Бағдарламаны Іске Қосу",
    "control.stop": "Тоқтату",
    "control.save": "Сақтау",
    "control.load": "Жүктеу",
    "workspace.title": "Визуалды Редактор",
    "workspace.info": "Бағдарламаны қазір жасай аласыз. WeDo қосып, іске қосыңыз.",
    "telemetry.title": "Телеметрия",
    "telemetry.motion": "Қозғалыс",
    "telemetry.tilt": "Еңкею",
    "telemetry.light": "Жарық",
    "telemetry.button": "Батырма",
    "telemetry.led": "LED Түсі",
    "console.title": "Консоль Логы",
    "error.notConnected": "WeDo құрылғысына қосылыңыз",
    "error.blocklyNotLoaded": "Blockly жүктелмеді",
    "success.programComplete": "Бағдарлама аяқталды",
    "info.programStopped": "Бағдарлама тоқтатылды",
    "success.saved": "Бағдарлама сақталды",
    "success.loaded": "Бағдарлама жүктелді",
    "error.noSavedProgram": "Сақталған бағдарлама жоқ",
  },
  ru: {
    "app.title": "S7 Робототехника",
    "app.subtitle": "Платформа Визуального Программирования",
    "status.label": "Статус:",
    "status.disconnected": "Отключено",
    "status.connecting": "Подключение...",
    "status.connected": "Подключено",
    "menu.visual": "Визуальная Карта",
    "menu.constructor": "Конструктор Робота",
    "menu.main": "Главная/Нейросеть",
    "menu.projects": "Мои Проекты",
    "projects.title": "Мои Проекты",
    "projects.new": "Новый Проект",
    "projects.empty": "Нет проектов",
    "projects.create": "Нажмите кнопку выше, чтобы создать новый проект",
    "projects.delete": "Удалить",
    "projects.open": "Открыть",
    "projects.name": "Название Проекта",
    "projects.created": "Создан",
    "projects.modified": "Изменен",
    "control.title": "Управление Устройством",
    "control.connect": "Подключить WeDo",
    "control.disconnect": "Отключить",
    "control.run": "Запустить Программу",
    "control.stop": "Остановить",
    "control.save": "Сохранить",
    "control.load": "Загрузить",
    "workspace.title": "Визуальный Редактор",
    "workspace.info": "Создайте программу. Подключите WeDo для запуска.",
    "telemetry.title": "Телеметрия",
    "telemetry.motion": "Движение",
    "telemetry.tilt": "Наклон",
    "telemetry.light": "Свет",
    "telemetry.button": "Кнопка",
    "telemetry.led": "Цвет LED",
    "console.title": "Консоль Лог",
    "error.notConnected": "Подключитесь к устройству WeDo",
    "error.blocklyNotLoaded": "Blockly не загружен",
    "success.programComplete": "Программа завершена",
    "info.programStopped": "Программа остановлена",
    "success.saved": "Программа сохранена",
    "success.loaded": "Программа загружена",
    "error.noSavedProgram": "Нет сохраненной программы",
  },
  en: {
    "app.title": "S7 Robotics",
    "app.subtitle": "Visual Programming Platform",
    "status.label": "Status:",
    "status.disconnected": "Disconnected",
    "status.connecting": "Connecting...",
    "status.connected": "Connected",
    "menu.visual": "Visual Map",
    "menu.constructor": "Robot Constructor",
    "menu.main": "Main/Neural Network",
    "menu.projects": "My Projects",
    "projects.title": "My Projects",
    "projects.new": "New Project",
    "projects.empty": "No projects yet",
    "projects.create": "Click the button above to create a new project",
    "projects.delete": "Delete",
    "projects.open": "Open",
    "projects.name": "Project Name",
    "projects.created": "Created",
    "projects.modified": "Modified",
    "control.title": "Device Control",
    "control.connect": "Connect WeDo",
    "control.disconnect": "Disconnect",
    "control.run": "Run Program",
    "control.stop": "Stop",
    "control.save": "Save",
    "control.load": "Load",
    "workspace.title": "Visual Editor",
    "workspace.info": "Create your program now. Connect WeDo to run it.",
    "telemetry.title": "Telemetry",
    "telemetry.motion": "Motion",
    "telemetry.tilt": "Tilt",
    "telemetry.light": "Light",
    "telemetry.button": "Button",
    "telemetry.led": "LED Color",
    "console.title": "Console Log",
    "error.notConnected": "Please connect to WeDo device",
    "error.blocklyNotLoaded": "Blockly not loaded",
    "success.programComplete": "Program completed",
    "info.programStopped": "Program stopped",
    "success.saved": "Program saved",
    "success.loaded": "Program loaded",
    "error.noSavedProgram": "No saved program",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("kk");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.kk] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
