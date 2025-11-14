import { useEffect, useRef, useState } from "react";
import { Play, Square, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
  on3DMotorChange?: (speed: number) => void;
  on3DLedChange?: (color: string) => void;
}

// Чтобы блоки не создавались повторно
let blocksInitialized = false;

// Лейблы под язык
const getLabels = (lang: string) => {
  const kk = {
    motor: "қозғалтқыш",
    on: "қосу",
    off: "өшіру",
    for: "үшін",
    seconds: "секунд",
    setDirection: "бағыт орнату",
    forward: "алға",
    backward: "артқа",
    setLed: "шам түсін орнату",
  };

  const ru = {
    motor: "мотор",
    on: "включить",
    off: "выключить",
    for: "на",
    seconds: "секунд",
    setDirection: "установить направление",
    forward: "вперед",
    backward: "назад",
    setLed: "цвет лампы",
  };

  const en = {
    motor: "motor",
    on: "turn on",
    off: "turn off",
    for: "for",
    seconds: "seconds",
    setDirection: "set direction",
    forward: "forward",
    backward: "backward",
    setLed: "set LED",
  };

  return lang === "kk" ? kk : lang === "ru" ? ru : en;
};

// Создание блоков (один раз)
const defineBlocks = () => {
  if (blocksInitialized) return;
  blocksInitialized = true;

  // 🚀 СТАРТ БЛОГЫ
  Blockly.Blocks["wedo_start"] = {
    init() {
      this.appendDummyInput().appendField("🚀 Бағдарлама басталғанда");
      this.appendStatementInput("STACK");
      this.setColour(0);
      this.setDeletable(false);
      this.setMovable(true);
    },
  };

  // 🚗 Мотор A
  Blockly.Blocks["wedo_motor_a"] = {
    init() {
      this.appendDummyInput()
        .appendField("🚗 Мотор A жылдамдық")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "SPEED");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // 🚗 Мотор B
  Blockly.Blocks["wedo_motor_b"] = {
    init() {
      this.appendDummyInput()
        .appendField("🚗 Мотор B жылдамдық")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "SPEED");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // ⏱️ Мотор A уақытқа
  Blockly.Blocks["wedo_motor_a_timed"] = {
    init() {
      this.appendDummyInput()
        .appendField("🚗 Мотор A жылдамдық")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "SPEED")
        .appendField("уақыт")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
        .appendField("сек");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
    },
  };

  // ⏱️ Мотор B уақытқа
  Blockly.Blocks["wedo_motor_b_timed"] = {
    init() {
      this.appendDummyInput()
        .appendField("🚗 Мотор B жылдамдық")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "SPEED")
        .appendField("уақыт")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
        .appendField("сек");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
    },
  };

  // ⏹️ Моторды тоқтату
  Blockly.Blocks["wedo_motor_stop"] = {
    init() {
      this.appendDummyInput().appendField("⏹️ Моторды тоқтату");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // ⏱️ Күту
  Blockly.Blocks["wedo_wait"] = {
    init() {
      this.appendDummyInput()
        .appendField("⏱️ Күту")
        .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), "SECONDS")
        .appendField("секунд");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(290);
    },
  };

  // 💡 LED
  Blockly.Blocks["wedo_led"] = {
    init() {
      this.appendDummyInput()
        .appendField("💡 LED түсі")
        .appendField(
          new Blockly.FieldDropdown([
            ["🔴 Қызыл", "9"],
            ["🟢 Жасыл", "7"],
            ["🔵 Көк", "3"],
            ["🟡 Сары", "8"],
            ["⚫ Өшіру", "0"],
          ]),
          "COLOR"
        );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(45);
    },
  };

  // === Генераторы ===

  javascriptGenerator.forBlock["wedo_start"] = (block, generator) => {
    const stack = generator.statementToCode(block, "STACK");
    return stack;
  };

  javascriptGenerator.forBlock["wedo_motor_a"] = (block) => {
    const speed = block.getFieldValue("SPEED");
    return `set3DMotor(${speed});
await wedo.setMotorA(${speed});\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_b"] = (block) => {
    const speed = block.getFieldValue("SPEED");
    return `set3DMotor(${speed});
await wedo.setMotorB(${speed});\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_a_timed"] = (block) => {
    const speed = block.getFieldValue("SPEED");
    const seconds = block.getFieldValue("SECONDS");
    return `set3DMotor(${speed});
await wedo.setMotorA(${speed});
await new Promise(r => setTimeout(r, ${seconds * 1000}));
set3DMotor(0);
await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_b_timed"] = (block) => {
    const speed = block.getFieldValue("SPEED");
    const seconds = block.getFieldValue("SECONDS");
    return `set3DMotor(${speed});
await wedo.setMotorB(${speed});
await new Promise(r => setTimeout(r, ${seconds * 1000}));
set3DMotor(0);
await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_stop"] = () => {
    return `set3DMotor(0);
await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_wait"] = (block) => {
    const sec = block.getFieldValue("SECONDS");
    return `await new Promise(r => setTimeout(r, ${sec * 1000}));\n`;
  };

  javascriptGenerator.forBlock["wedo_led"] = (block) => {
    const color = block.getFieldValue("COLOR");
    const colorMap: any = { "9": "#f44336", "7": "#4caf50", "3": "#2196f3", "8": "#ffeb3b", "0": "#000" };
    return `set3DLed(${JSON.stringify(colorMap[color] || "#000")});
await wedo.setHubLed(${color});\n`;
  };
};

// === Основной компонент ===
export const BlocklyWorkspace = ({ wedo, on3DMotorChange, on3DLedChange }: BlocklyWorkspaceProps) => {
  const blocklyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [running, setRunning] = useState(false);
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // Инициализация блоков один раз
  useEffect(() => {
    defineBlocks();
  }, []);

  // Лейблы под язык
  useEffect(() => {
    const lbl = getLabels(language);
    Blockly.Msg["WEDO_TURN_MOTOR_FOR"] = `${lbl.on} ${lbl.motor} ${lbl.for}`;
    Blockly.Msg["WEDO_TURN_MOTOR_OFF"] = `${lbl.off} ${lbl.motor}`;
    Blockly.Msg["WEDO_DIRECTION"] = lbl.setDirection;
    Blockly.Msg["WEDO_FORWARD"] = lbl.forward;
    Blockly.Msg["WEDO_BACKWARD"] = lbl.backward;
    Blockly.Msg["WEDO_SECONDS"] = lbl.seconds;
    Blockly.Msg["WEDO_LED"] = lbl.setLed;
  }, [language]);

  // Инициализация workspace (только один раз)
  useEffect(() => {
    if (!blocklyRef.current || workspaceRef.current) return;

    const toolboxXml = `
      <xml>
        <category name="🚀 Басталу" colour="0">
          <block type="wedo_start"></block>
        </category>

        <category name="🚗 Моторлар" colour="120">
          <block type="wedo_motor_a"></block>
          <block type="wedo_motor_b"></block>
          <block type="wedo_motor_a_timed"></block>
          <block type="wedo_motor_b_timed"></block>
          <block type="wedo_motor_stop"></block>
        </category>

        <category name="💡 LED" colour="45">
          <block type="wedo_led"></block>
        </category>

        <category name="⏱️ Күту" colour="290">
          <block type="wedo_wait"></block>
        </category>
      </xml>
    `;

    const workspace = Blockly.inject(blocklyRef.current, {
      toolbox: toolboxXml,
      trashcan: true,
      grid: {
        spacing: 20,
        length: 3,
        snap: true,
        colour: theme === "dark" ? "#222" : "#ccc",
      },
      zoom: { controls: true, wheel: true },
    });

    workspaceRef.current = workspace;

    // Загрузка сохраненного workspace из localStorage
    const savedWorkspace = localStorage.getItem("blockly_workspace");
    if (savedWorkspace) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedWorkspace);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Ошибка загрузки workspace:", e);
        // Если ошибка, создаем стартовый блок
        const startBlock = workspace.newBlock("wedo_start");
        startBlock.initSvg();
        startBlock.render();
        startBlock.moveBy(50, 50);
      }
    } else {
      // Первый запуск - создаем стартовый блок
      const startBlock = workspace.newBlock("wedo_start");
      startBlock.initSvg();
      startBlock.render();
      startBlock.moveBy(50, 50);
    }

    // Автосохранение при изменении
    workspace.addChangeListener(() => {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem("blockly_workspace", xmlText);
    });

    return () => {
      // Сохранение перед закрытием
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem("blockly_workspace", xmlText);
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [theme]);

  const run = async () => {
    if (!workspaceRef.current) return;

    console.log("🚀 Бағдарлама басталды");

    if (wedo.status !== "Connected") {
      console.error("⚠️ WeDo қосылмаған!");
      alert("⚠️ Алдымен WeDo-ны қосыңыз!");
      return;
    }

    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    console.log("📝 Генерацияланған код:\n", code);

    if (!code.trim()) {
      console.warn("⚠️ Бос бағдарлама!");
      alert("⚠️ Блоктарды қосыңыз!");
      return;
    }

    setRunning(true);
    try {
      // Create context with WeDo and 3D callbacks
      const set3DMotor = on3DMotorChange || (() => {});
      const set3DLed = on3DLedChange || (() => {});

      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("wedo", "set3DMotor", "set3DLed", code)(wedo, set3DMotor, set3DLed);
      console.log("✅ Бағдарлама аяқталды");
    } catch (e) {
      console.error("❌ Қате:", e);
    } finally {
      setRunning(false);
      // Reset 3D animations
      on3DMotorChange?.(0);
    }
  };

  const saveWorkspace = () => {
    if (!workspaceRef.current) return;
    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
    const xmlText = Blockly.Xml.domToText(xml);

    const blob = new Blob([xmlText], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedo_program.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadWorkspace = () => {
    if (!workspaceRef.current) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const xmlText = event.target?.result as string;
          const xml = Blockly.utils.xml.textToDom(xmlText);
          workspaceRef.current?.clear();
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current!);
        } catch (err) {
          console.error("Қате жүктеу кезінде:", err);
          alert("❌ Файлды жүктеу қатесі!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };


  return (
    <div className="flex flex-col h-full gap-4">
      {/* Басқару батырмалары */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveWorkspace}>
            <Save className="w-4 h-4 mr-2" /> {t("control.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={loadWorkspace}>
            <FolderOpen className="w-4 h-4 mr-2" /> {t("control.load")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={run} disabled={running || wedo.status !== "Connected"} className="bg-green-600 text-white">
            <Play className="w-4 h-4 mr-2" /> {t("control.run")}
          </Button>
          <Button disabled={!running} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> {t("control.stop")}
          </Button>
        </div>
      </div>

      {/* Ескерту - қосылмаған */}
      {wedo.status !== "Connected" && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded">
          ⚠️ WeDo қосылмаған! Оң жақтағы "Қосылу" батырмасын басыңыз.
        </div>
      )}

      {/* Blockly workspace */}
      <div
        ref={blocklyRef}
        className="flex-1 rounded-lg overflow-hidden border border-border1"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
