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

  // Мотор включить на время
  Blockly.Blocks["wedo_motor_run"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_TURN_MOTOR_FOR}")
        .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
        .appendField("%{BKY_WEDO_SECONDS}");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // Мотор стоп
  Blockly.Blocks["wedo_motor_stop"] = {
    init() {
      this.appendDummyInput().appendField("%{BKY_WEDO_TURN_MOTOR_OFF}");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // Направление
  Blockly.Blocks["wedo_motor_direction"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_DIRECTION}")
        .appendField(
          new Blockly.FieldDropdown([
            ["%{BKY_WEDO_FORWARD}", "100"],
            ["%{BKY_WEDO_BACKWARD}", "-100"],
          ]),
          "DIR"
        );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // Цвет LED
  Blockly.Blocks["wedo_led"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_LED}")
        .appendField(
          new Blockly.FieldDropdown([
            ["🔴 red", "9"],
            ["🟢 green", "7"],
            ["🔵 blue", "3"],
            ["⚫ off", "0"],
          ]),
          "COLOR"
        );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(45);
    },
  };

  // === Генераторы ===

  javascriptGenerator.forBlock["wedo_motor_run"] = (block) => {
    const sec = block.getFieldValue("SECONDS");
    return `await wedo.runMotor(100);
await new Promise(r => setTimeout(r, ${sec * 1000}));
await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_stop"] = () => {
    return `await wedo.stopMotor();\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_direction"] = (block) => {
    const dir = block.getFieldValue("DIR");
    return `await wedo.runMotor(${dir});\n`;
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
        <category name="${t("blocks.motor")}" colour="120">
          <block type="wedo_motor_run"></block>
          <block type="wedo_motor_stop"></block>
          <block type="wedo_motor_direction"></block>
        </category>

        <category name="${t("blocks.led")}" colour="45">
          <block type="wedo_led"></block>
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

    return () => workspace.dispose();
  }, [language, theme, t]);

  const run = async () => {
    if (!workspaceRef.current) return;
    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);

    setRunning(true);
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("wedo", code)(wedo);
    } finally {
      setRunning(false);
    }
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
          <Button onClick={run} disabled={running} className="bg-green-600 text-white">
            <Play className="w-4 h-4 mr-2" /> {t("control.run")}
          </Button>
          <Button disabled={!running} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> {t("control.stop")}
          </Button>
        </div>
      </div>

      <div
        ref={blocklyRef}
        className="flex-1 rounded-lg overflow-hidden border border-border1"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
