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
    return `await wedo.setMotorA(${speed});\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_b"] = (block) => {
    const speed = block.getFieldValue("SPEED");
    return `await wedo.setMotorB(${speed});\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_stop"] = () => {
    return `await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_wait"] = (block) => {
    const sec = block.getFieldValue("SECONDS");
    return `await new Promise(r => setTimeout(r, ${sec * 1000}));\n`;
  };

  javascriptGenerator.forBlock["wedo_led"] = (block) => {
    const color = block.getFieldValue("COLOR");
    return `await wedo.setHubLed(${color});\n`;
  };
};

// === Основной компонент ===
export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
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

  // Инициализация workspace
  useEffect(() => {
    if (!blocklyRef.current) return;

    const toolboxXml = `
      <xml>
        <category name="🚀 Басталу" colour="0">
          <block type="wedo_start"></block>
        </category>

        <category name="🚗 Моторлар" colour="120">
          <block type="wedo_motor_a"></block>
          <block type="wedo_motor_b"></block>
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

    // Автоматты түрде старт блогын қосу
    const startBlock = workspace.newBlock("wedo_start");
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(50, 50);

    return () => workspace.dispose();
  }, [language, theme, t]);

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
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("wedo", code)(wedo);
      console.log("✅ Бағдарлама аяқталды");
    } catch (e) {
      console.error("❌ Қате:", e);
    } finally {
      setRunning(false);
    }
  };

  const testMotorProtocols = async () => {
    if (wedo.status !== "Connected") {
      alert("⚠️ Алдымен WeDo-ны қосыңыз!");
      return;
    }
    console.clear();
    await wedo.testMotor();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" /> {t("control.save")}
          </Button>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" /> {t("control.load")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testMotorProtocols}
            disabled={wedo.status !== "Connected"}
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            🧪 Моторды тест
          </Button>
          <Button onClick={run} disabled={running || wedo.status !== "Connected"} className="bg-green-600 text-white">
            <Play className="w-4 h-4 mr-2" /> {t("control.run")}
          </Button>
          <Button disabled={!running} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> {t("control.stop")}
          </Button>
        </div>
      </div>

      {wedo.status !== "Connected" && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded">
          ⚠️ WeDo қосылмаған! Оң жақтағы "Қосылу" батырмасын басыңыз.
        </div>
      )}

      <div
        ref={blocklyRef}
        className="flex-1 rounded-lg overflow-hidden border border-border1"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
