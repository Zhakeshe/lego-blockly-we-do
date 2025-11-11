import { useEffect, useRef, useState } from "react";
import { Play, Square, Save, FolderOpen, Bluetooth } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

let blocksInitialized = false;

const getLabels = (lang: string) => {
  const kk = {
    motor: "қозғалтқыш",
    motorPort: "порт",
    on: "қосу",
    off: "өшіру",
    for: "үшін",
    seconds: "секунд",
    power: "қуат",
    setDirection: "бағыт орнату",
    forward: "алға",
    backward: "артқа",
    setLed: "шам түсін орнату",
    sensor: "датчик",
    distance: "қашықтық",
    wait: "күту",
    until: "дейін",
  };

  const ru = {
    motor: "мотор",
    motorPort: "порт",
    on: "включить",
    off: "выключить",
    for: "на",
    seconds: "секунд",
    power: "мощность",
    setDirection: "направление",
    forward: "вперед",
    backward: "назад",
    setLed: "цвет лампы",
    sensor: "датчик",
    distance: "расстояние",
    wait: "ждать",
    until: "пока",
  };

  const en = {
    motor: "motor",
    motorPort: "port",
    on: "turn on",
    off: "turn off",
    for: "for",
    seconds: "seconds",
    power: "power",
    setDirection: "direction",
    forward: "forward",
    backward: "backward",
    setLed: "set LED",
    sensor: "sensor",
    distance: "distance",
    wait: "wait",
    until: "until",
  };

  return lang === "kk" ? kk : lang === "ru" ? ru : en;
};

const defineBlocks = () => {
  if (blocksInitialized) return;
  blocksInitialized = true;

  // Мотор қуатпен қосу
  Blockly.Blocks["wedo_motor_power"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_MOTOR}")
        .appendField(new Blockly.FieldDropdown([
          ["A", "A"],
          ["B", "B"]
        ]), "PORT")
        .appendField("%{BKY_WEDO_POWER}")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "POWER");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // Мотор уақытқа қосу
  Blockly.Blocks["wedo_motor_run"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_MOTOR}")
        .appendField(new Blockly.FieldDropdown([
          ["A", "A"],
          ["B", "B"]
        ]), "PORT")
        .appendField("%{BKY_WEDO_ON}")
        .appendField(new Blockly.FieldNumber(100, -100, 100), "POWER")
        .appendField("%{BKY_WEDO_FOR}")
        .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
        .appendField("%{BKY_WEDO_SECONDS}");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // Мотор тоқтату
  Blockly.Blocks["wedo_motor_stop"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_MOTOR}")
        .appendField(new Blockly.FieldDropdown([
          ["A", "A"],
          ["B", "B"],
          ["A+B", "ALL"]
        ]), "PORT")
        .appendField("%{BKY_WEDO_OFF}");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
    },
  };

  // LED түс
  Blockly.Blocks["wedo_led"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_LED}")
        .appendField(
          new Blockly.FieldDropdown([
            ["🔴 қызыл/red", "9"],
            ["🟢 жасыл/green", "7"],
            ["🔵 көк/blue", "3"],
            ["🟡 сары/yellow", "8"],
            ["🟣 күлгін/purple", "5"],
            ["⚫ өшіру/off", "0"],
          ]),
          "COLOR"
        );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(45);
    },
  };

  // Датчик оқу
  Blockly.Blocks["wedo_read_sensor"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_SENSOR}")
        .appendField(new Blockly.FieldDropdown([
          ["қашықтық/distance", "distance"],
          ["еңіс/tilt", "tilt"]
        ]), "TYPE");
      this.setOutput(true, "Number");
      this.setColour(230);
    },
  };

  // Күту
  Blockly.Blocks["wedo_wait"] = {
    init() {
      this.appendDummyInput()
        .appendField("%{BKY_WEDO_WAIT}")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECONDS")
        .appendField("%{BKY_WEDO_SECONDS}");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(290);
    },
  };

  // === Генераторлар ===

  javascriptGenerator.forBlock["wedo_motor_power"] = (block) => {
    const port = block.getFieldValue("PORT");
    const power = block.getFieldValue("POWER");
    return `await wedo.setMotor${port}(${power});\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_run"] = (block) => {
    const port = block.getFieldValue("PORT");
    const power = block.getFieldValue("POWER");
    const sec = block.getFieldValue("SECONDS");
    return `await wedo.setMotor${port}(${power});
await new Promise(r => setTimeout(r, ${sec * 1000}));
await wedo.setMotor${port}(0);\n`;
  };

  javascriptGenerator.forBlock["wedo_motor_stop"] = (block) => {
    const port = block.getFieldValue("PORT");
    if (port === "ALL") {
      return `await wedo.setMotorA(0);
await wedo.setMotorB(0);\n`;
    }
    return `await wedo.setMotor${port}(0);\n`;
  };

  javascriptGenerator.forBlock["wedo_led"] = (block) => {
    const color = block.getFieldValue("COLOR");
    return `await wedo.setLed(${color});\n`;
  };

  javascriptGenerator.forBlock["wedo_read_sensor"] = (block) => {
    const type = block.getFieldValue("TYPE");
    return [`wedo.${type}`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock["wedo_wait"] = (block) => {
    const sec = block.getFieldValue("SECONDS");
    return `await new Promise(r => setTimeout(r, ${sec * 1000}));\n`;
  };
};

export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [running, setRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    defineBlocks();
  }, []);

  // WeDo байланысын тексеру
  useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsConnected(wedo.isConnected);
    }, 1000);
    return () => clearInterval(checkConnection);
  }, [wedo]);

  useEffect(() => {
    const lbl = getLabels(language);
    Blockly.Msg["WEDO_MOTOR"] = lbl.motor;
    Blockly.Msg["WEDO_POWER"] = lbl.power;
    Blockly.Msg["WEDO_ON"] = lbl.on;
    Blockly.Msg["WEDO_OFF"] = lbl.off;
    Blockly.Msg["WEDO_FOR"] = lbl.for;
    Blockly.Msg["WEDO_SECONDS"] = lbl.seconds;
    Blockly.Msg["WEDO_LED"] = lbl.setLed;
    Blockly.Msg["WEDO_SENSOR"] = lbl.sensor;
    Blockly.Msg["WEDO_WAIT"] = lbl.wait;
  }, [language]);

  useEffect(() => {
    if (!blocklyRef.current) return;

    const toolboxXml = `
      <xml>
        <category name="🚗 ${t("blocks.motor") || "Моторлар"}" colour="120">
          <block type="wedo_motor_power"></block>
          <block type="wedo_motor_run"></block>
          <block type="wedo_motor_stop"></block>
        </category>

        <category name="💡 ${t("blocks.led") || "LED"}" colour="45">
          <block type="wedo_led"></block>
        </category>

        <category name="📡 Датчиктер" colour="230">
          <block type="wedo_read_sensor"></block>
        </category>

        <category name="⏱️ Уақыт" colour="290">
          <block type="wedo_wait"></block>
        </category>

        <category name="🔄 Логика" colour="210">
          <block type="controls_if"></block>
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="logic_compare"></block>
        </category>

        <category name="🔢 Математика" colour="230">
          <block type="math_number"></block>
          <block type="math_arithmetic"></block>
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
      zoom: { controls: true, wheel: true, startScale: 1.0 },
    });

    workspaceRef.current = workspace;
    
    const saved = localStorage.getItem("wedo_blockly_workspace");
    if (saved) {
      try {
        const xml = Blockly.utils.xml.textToDom(saved);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Жүктеу қатесі:", e);
      }
    }

    return () => workspace.dispose();
  }, [language, theme, t]);

  const run = async () => {
    if (!workspaceRef.current) return;
    
    if (!isConnected) {
      alert("WeDo қосылмаған! Алдымен Bluetooth арқылы қосыңыз.");
      return;
    }

    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    console.log("Жасалған код:", code);

    setRunning(true);
    abortControllerRef.current = new AbortController();
    
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("wedo", "signal", code)(wedo, abortControllerRef.current.signal);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Программа тоқтатылды');
      } else {
        console.error('Қате:', error);
        alert('Қате орын алды: ' + error.message);
      }
    } finally {
      setRunning(false);
      abortControllerRef.current = null;
      await wedo.setMotorA(0);
      await wedo.setMotorB(0);
    }
  };

  const stop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await wedo.setMotorA(0);
    await wedo.setMotorB(0);
    setRunning(false);
  };

  const saveProject = () => {
    if (!workspaceRef.current) return;
    
    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
    const xmlText = Blockly.Xml.domToText(xml);
    
    localStorage.setItem("wedo_blockly_workspace", xmlText);
    
    const blob = new Blob([xmlText], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedo_project_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xml";
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !workspaceRef.current) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const xmlText = event.target?.result as string;
          const xml = Blockly.utils.xml.textToDom(xmlText);
          workspaceRef.current?.clear();
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current!);
        } catch (error) {
          console.error("Жүктеу қатесі:", error);
          alert("Файлды жүктеу мүмкін болмады!");
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={saveProject}>
            <Save className="w-4 h-4 mr-2" /> {t("control.save") || "Сақтау"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadProject}>
            <FolderOpen className="w-4 h-4 mr-2" /> {t("control.load") || "Ашу"}
          </Button>
          
          <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-md bg-secondary">
            <Bluetooth className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm">
              {isConnected ? "Қосылған" : "Қосылмаған"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={run} 
            disabled={running || !isConnected} 
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" /> {t("control.run") || "Іске қосу"}
          </Button>
          <Button onClick={stop} disabled={!running} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> {t("control.stop") || "Тоқтату"}
          </Button>
        </div>
      </div>

      <div
        ref={blocklyRef}
        className="flex-1 rounded-lg overflow-hidden border border-border"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
