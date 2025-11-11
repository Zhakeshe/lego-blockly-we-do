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
    programStart: "Бағдарлама басталғанда",
    motor: "қозғалтқыш",
    on: "қосу",
    off: "өшіру",
    for: "үшін",
    seconds: "секунд",
    power: "қуат",
    setLed: "шам түсін орнату",
    sensor: "датчик",
    distance: "қашықтық",
    wait: "күту",
  };

  const ru = {
    programStart: "Когда программа начинается",
    motor: "мотор",
    on: "включить",
    off: "выключить",
    for: "на",
    seconds: "секунд",
    power: "мощность",
    setLed: "цвет лампы",
    sensor: "датчик",
    distance: "расстояние",
    wait: "ждать",
  };

  const en = {
    programStart: "When program starts",
    motor: "motor",
    on: "turn on",
    off: "turn off",
    for: "for",
    seconds: "seconds",
    power: "power",
    setLed: "set LED",
    sensor: "sensor",
    distance: "distance",
    wait: "wait",
  };

  return lang === "kk" ? kk : lang === "ru" ? ru : en;
};

const defineBlocks = () => {
  if (blocksInitialized) return;
  blocksInitialized = true;

  // БАСТЫ БЛОК - Бағдарлама басталғанда
  Blockly.Blocks["wedo_program_start"] = {
    init() {
      this.appendDummyInput()
        .appendField("🚀 %{BKY_WEDO_PROGRAM_START}");
      this.setNextStatement(true);
      this.setColour(160);
      this.setDeletable(false); // Өшіруге болмайды
    },
  };

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
            ["🔴 қызыл", "9"],
            ["🟢 жасыл", "7"],
            ["🔵 көк", "3"],
            ["🟡 сары", "8"],
            ["🟣 күлгін", "5"],
            ["⚪ ақ", "10"],
            ["⚫ өшіру", "0"],
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
          ["қашықтық", "distance"],
          ["еңіс X", "tiltX"],
          ["еңіс Y", "tiltY"]
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

  // Дыбыс ойнату
  Blockly.Blocks["wedo_play_note"] = {
    init() {
      this.appendDummyInput()
        .appendField("🎵 дыбыс")
        .appendField(new Blockly.FieldDropdown([
          ["До", "262"],
          ["Ре", "294"],
          ["Ми", "330"],
          ["Фа", "349"],
          ["Соль", "392"],
          ["Ля", "440"],
          ["Си", "494"],
        ]), "NOTE")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 5), "DURATION")
        .appendField("сек");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(65);
    },
  };

  // === Генераторлар ===

  javascriptGenerator.forBlock["wedo_program_start"] = () => {
    return "// Бағдарлама басталды\n";
  };

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
    return [`(wedo.${type} || 0)`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock["wedo_wait"] = (block) => {
    const sec = block.getFieldValue("SECONDS");
    return `await new Promise(r => setTimeout(r, ${sec * 1000}));\n`;
  };

  javascriptGenerator.forBlock["wedo_play_note"] = (block) => {
    const note = block.getFieldValue("NOTE");
    const duration = block.getFieldValue("DURATION");
    return `await wedo.playTone(${note}, ${duration * 1000});\n`;
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
    const checkConnection = () => {
      setIsConnected(!!wedo.device || wedo.isConnected);
    };
    checkConnection();
    const interval = setInterval(checkConnection, 500);
    return () => clearInterval(interval);
  }, [wedo]);

  useEffect(() => {
    const lbl = getLabels(language);
    Blockly.Msg["WEDO_PROGRAM_START"] = lbl.programStart;
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
        <category name="🚀 Басталу" colour="160">
          <block type="wedo_program_start"></block>
        </category>

        <category name="🚗 Моторлар" colour="120">
          <block type="wedo_motor_power">
            <field name="PORT">A</field>
            <field name="POWER">100</field>
          </block>
          <block type="wedo_motor_run">
            <field name="PORT">A</field>
            <field name="POWER">100</field>
            <field name="SECONDS">2</field>
          </block>
          <block type="wedo_motor_stop">
            <field name="PORT">A</field>
          </block>
        </category>

        <category name="💡 LED" colour="45">
          <block type="wedo_led"></block>
        </category>

        <category name="📡 Датчиктер" colour="230">
          <block type="wedo_read_sensor"></block>
        </category>

        <category name="🎵 Дыбыс" colour="65">
          <block type="wedo_play_note"></block>
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
          <block type="logic_operation"></block>
        </category>

        <category name="🔢 Математика" colour="230">
          <block type="math_number"></block>
          <block type="math_arithmetic"></block>
        </category>

        <category name="📝 Айнымалылар" colour="330" custom="VARIABLE"></category>
      </xml>
    `;

    const workspace = Blockly.inject(blocklyRef.current, {
      toolbox: toolboxXml,
      trashcan: true,
      grid: {
        spacing: 20,
        length: 3,
        snap: true,
        colour: theme === "dark" ? "#333" : "#ddd",
      },
      zoom: { controls: true, wheel: true, startScale: 0.9 },
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
    } else {
      // Бастапқы блокты қосу
      const startBlock = workspace.newBlock("wedo_program_start");
      startBlock.initSvg();
      startBlock.render();
      startBlock.moveBy(50, 50);
    }

    return () => workspace.dispose();
  }, [language, theme, t]);

  const run = async () => {
    if (!workspaceRef.current) return;
    
    if (!isConnected) {
      alert("⚠️ WeDo қосылмаған!\n\nАлдымен Bluetooth арқылы қосыңыз:\n1. WeDo-ды қосыңыз\n2. Bluetooth батырмасын басыңыз\n3. Қосылуды күтіңіз");
      return;
    }

    // Start блогын тексеру
    const blocks = workspaceRef.current.getAllBlocks(false);
    const hasStart = blocks.some(block => block.type === "wedo_program_start");
    
    if (!hasStart) {
      alert("⚠️ Қате!\n\n'Бағдарлама басталғанда' блогын қосыңыз!");
      return;
    }

    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    console.log("🚀 Жасалған код:\n", code);

    if (!code || code.trim() === "// Бағдарлама басталды") {
      alert("⚠️ Бағдарлама бос!\n\nБлоктарды қосыңыз.");
      return;
    }

    setRunning(true);
    abortControllerRef.current = new AbortController();
    
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction("wedo", "signal", code)(wedo, abortControllerRef.current.signal);
      console.log("✅ Бағдарлама аяқталды");
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('⏹️ Бағдарлама тоқтатылды');
      } else {
        console.error('❌ Қате:', error);
        alert('❌ Қате орын алды:\n' + error.message);
      }
    } finally {
      setRunning(false);
      abortControllerRef.current = null;
      try {
        await wedo.setMotorA?.(0);
        await wedo.setMotorB?.(0);
      } catch (e) {
        console.error("Моторды тоқтату қатесі:", e);
      }
    }
  };

  const stop = async () => {
    console.log("⏹️ Тоқтату...");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      await wedo.setMotorA?.(0);
      await wedo.setMotorB?.(0);
    } catch (e) {
      console.error("Тоқтату қатесі:", e);
    }
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
    
    console.log("💾 Проект сақталды!");
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
          console.log("📂 Проект жүктелді!");
        } catch (error) {
          console.error("Жүктеу қатесі:", error);
          alert("❌ Файлды жүктеу мүмкін болмады!");
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
            <Save className="w-4 h-4 mr-2" /> Сақтау
          </Button>
          <Button variant="outline" size="sm" onClick={loadProject}>
            <FolderOpen className="w-4 h-4 mr-2" /> Ашу
          </Button>
          
          <div className={`flex items-center gap-2 ml-4 px-3 py-1.5 rounded-md transition-colors ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <Bluetooth className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isConnected ? "Қосылған" : "Қосылмаған"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={run} 
            disabled={running} 
            className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500"
          >
            <Play className="w-4 h-4 mr-2" /> Іске қосу
          </Button>
          <Button 
            onClick={stop} 
            disabled={!running} 
            variant="destructive"
            className="disabled:bg-gray-500"
          >
            <Square className="w-4 h-4 mr-2" /> Тоқтату
          </Button>
        </div>
      </div>

      <div
        ref={blocklyRef}
        className="flex-1 rounded-lg overflow-hidden border-2 border-border"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
