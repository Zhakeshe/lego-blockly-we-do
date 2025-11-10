
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

// чтобы блоки не переопределялись при каждом ререндере
let blocksDefined = false;

// === Языковые ярлыки ===
const getBlockLabels = (language: string) => {
  if (language === "kk") {
    return {
      motorOn: "қосу",
      motorOff: "өшіру",
      motorPower: "қуат орнату",
      motorDirection: "бағыт орнату",
      motor: "қозғалтқыш",
      on: "қосу",
      seconds: "секунд",
      setPower: "қуат орнату",
      to: "дейін",
      setDirection: "бағыт орнату",
      forward: "алға",
      backward: "артқа",
      setLedColor: "шам түсін орнату",
    };
  } else if (language === "ru") {
    return {
      motorOn: "включить",
      motorOff: "выключить",
      motorPower: "установить мощность",
      motorDirection: "установить направление",
      motor: "мотор",
      on: "на",
      seconds: "секунд",
      setPower: "установить мощность",
      to: "в",
      setDirection: "установить направление",
      forward: "вперёд ⇾",
      backward: "назад ⇽",
      setLedColor: "установить цвет лампочки",
    };
  } else {
    return {
      motorOn: "turn on",
      motorOff: "turn off",
      motorPower: "set motor power",
      motorDirection: "set motor direction",
      motor: "motor",
      on: "for",
      seconds: "seconds",
      setPower: "set power",
      to: "to",
      setDirection: "set direction",
      forward: "forward ⇾",
      backward: "backward ⇽",
      setLedColor: "set LED color",
    };
  }
};

// === Определение блоков и генераторов ===
const defineCustomBlocks = () => {
  if (blocksDefined) return;
  blocksDefined = true;

  const labels = getBlockLabels("en");

  // --- Блоки мотора ---
  Blockly.Blocks["wedo_motor_run"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOn)
        .appendField(new Blockly.FieldDropdown([[labels.motor, "motor"]]), "TYPE")
        .appendField(labels.on)
        .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
        .appendField(labels.seconds);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_stop"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOff)
        .appendField(new Blockly.FieldDropdown([[labels.motor, "motor"]]), "TYPE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
    },
  };

  // --- Генераторы JS ---
  javascriptGenerator.forBlock["wedo_motor_run"] = (block: any) => {
    const seconds = block.getFieldValue("SECONDS");
    return `
      await wedo.runMotor(100);
      await new Promise(r => setTimeout(r, ${seconds * 1000}));
      await wedo.stopMotor();
    `;
  };

  javascriptGenerator.forBlock["wedo_motor_stop"] = function () {
    return `await wedo.stopMotor();\n`;
  };

};

// === Компонент ===
export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // Определяем блоки один раз
  useEffect(() => {
    defineCustomBlocks();
  }, []);

  // Инициализация Blockly
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const toolbox = `
      <xml style="display:none">
        <category name="${t("blocks.motor")}" colour="65">
          <block type="wedo_motor_run"></block>
          <block type="wedo_motor_stop"></block>
        </category>
      </xml>
    `;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: theme === "dark" ? "#1a1a1a" : "#e0e0e0",
        snap: true,
      },
      zoom: { controls: true, wheel: true },
      trashcan: true,
    });

    workspaceRef.current = workspace;
    return () => workspace.dispose();
  }, [language, theme, t]);

  const runCode = async () => {
    if (!workspaceRef.current) return;
    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    try {
      setIsRunning(true);
      // eslint-disable-next-line no-eval
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      await new AsyncFunction('wedo', code)(wedo);
    } catch (err) {
      console.error("Error running code:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const stopCode = () => setIsRunning(false);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => console.log("Save clicked")}>
            <Save className="w-4 h-4 mr-2" /> {t("control.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => console.log("Load clicked")}>
            <FolderOpen className="w-4 h-4 mr-2" /> {t("control.load")}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" /> {t("control.run")}
          </Button>
          <Button
            onClick={stopCode}
            disabled={!isRunning}
            variant="destructive"
          >
            <Square className="w-4 h-4 mr-2" /> {t("control.stop")}
          </Button>
        </div>
      </div>

      <div
        ref={blocklyDiv}
        className="flex-1 bg-surface1 border border-dashed border-border1 rounded-lg overflow-hidden"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};

export default BlocklyWorkspace;
