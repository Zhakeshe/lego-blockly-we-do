import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import "blockly/javascript";
import { Button } from "@/components/ui/button";
import { Play, Square, Save, FolderOpen } from "lucide-react";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

// --- Multilingual block labels ---
const getLabels = (lang: string) => {
  if (lang === "kk") return {
    motorOn: "қосу",
    motorOff: "өшіру",
    motor: "қозғалтқыш",
    seconds: "секунд",
    forward: "алға",
    backward: "артқа",
    ledColor: "шам түсін орнату",
    distance: "қашықтық",
    tilted: "еңкейгенде",
    any: "кез келген"
  };
  if (lang === "ru") return {
    motorOn: "включить",
    motorOff: "выключить",
    motor: "мотор",
    seconds: "секунду",
    forward: "вперед",
    backward: "назад",
    ledColor: "установить цвет лампочки",
    distance: "расстояние",
    tilted: "наклонен",
    any: "любое"
  };
  return {
    motorOn: "turn on",
    motorOff: "turn off",
    motor: "motor",
    seconds: "seconds",
    forward: "forward",
    backward: "backward",
    ledColor: "set LED color",
    distance: "distance",
    tilted: "tilted",
    any: "any"
  };
};

// --- Define blocks (function uses labels from current language) ---
const defineBlocks = (labels: ReturnType<typeof getLabels>) => {
  // Motor run
  Blockly.Blocks["wedo_motor_run"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOn)
        .appendField(labels.motor)
        .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
        .appendField(labels.seconds);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_stop"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOff)
        .appendField(labels.motor);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_for_seconds"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOn)
        .appendField(labels.motor)
        .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
        .appendField(labels.seconds);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_led_color"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.ledColor)
        .appendField(new Blockly.FieldNumber(50, 0, 100), "COLOR");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(20);
    },
  };

  // Sensors
  Blockly.Blocks["wedo_sensor_motion"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.distance)
        .appendField(new Blockly.FieldNumber(50, 0, 100), "VALUE");
      this.setOutput(true, "Boolean");
      this.setColour(175);
    },
  };

  Blockly.Blocks["wedo_sensor_tilt"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.tilted)
        .appendField(labels.any);
      this.setOutput(true, "Boolean");
      this.setColour(175);
    },
  };

  Blockly.Blocks["wedo_sensor_light"] = {
    init: function () {
      this.appendDummyInput().appendField(labels.distance);
      this.setOutput(true, "Number");
      this.setColour(175);
    },
  };

  Blockly.Blocks["wedo_sensor_button"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.tilted)
        .appendField(labels.any);
      this.setOutput(true, "Boolean");
      this.setColour(175);
    },
  };

  // --- Generators ---
  Blockly.JavaScript["wedo_motor_run"] = (block: any) => {
    const seconds = block.getFieldValue("SECONDS");
    return `await window.wedo.runMotorForSeconds(${seconds});\n`;
  };
  Blockly.JavaScript["wedo_motor_stop"] = () => {
    return `await window.wedo.stopMotorBrake();\n`;
  };
  Blockly.JavaScript["wedo_motor_for_seconds"] = (block: any) => {
    const seconds = block.getFieldValue("SECONDS");
    return `await window.wedo.runMotorForSeconds(${seconds});\n`;
  };
  Blockly.JavaScript["wedo_led_color"] = (block: any) => {
    const color = block.getFieldValue("COLOR");
    return `await window.wedo.setLedColor(${color});\n`;
  };
  Blockly.JavaScript["wedo_sensor_motion"] = () => {
    return [`window.wedo.getMotion()`, Blockly.JavaScript.ORDER_ATOMIC];
  };
  Blockly.JavaScript["wedo_sensor_tilt"] = () => {
    return [`window.wedo.getTilt()`, Blockly.JavaScript.ORDER_ATOMIC];
  };
  Blockly.JavaScript["wedo_sensor_light"] = () => {
    return [`window.wedo.getDistance()`, Blockly.JavaScript.ORDER_ATOMIC];
  };
  Blockly.JavaScript["wedo_sensor_button"] = () => {
    return [`window.wedo.getButton()`, Blockly.JavaScript.ORDER_ATOMIC];
  };
};

// --- BlocklyWorkspace component ---
export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();

  // Make wedo global
  useEffect(() => {
    window.wedo = wedo;
  }, [wedo]);

  // Define blocks when language changes
  useEffect(() => {
    defineBlocks(getLabels(language));
    // Reload workspace if needed
  }, [language]);

  // Inject Blockly
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: `
        <xml>
          <category name="Motor" colour="65">
            <block type="wedo_motor_run"></block>
            <block type="wedo_motor_stop"></block>
            <block type="wedo_motor_for_seconds"></block>
          </category>
          <category name="LED" colour="20">
            <block type="wedo_led_color"></block>
          </category>
          <category name="Sensors" colour="175">
            <block type="wedo_sensor_motion"></block>
            <block type="wedo_sensor_tilt"></block>
            <block type="wedo_sensor_light"></block>
            <block type="wedo_sensor_button"></block>
          </category>
          <category name="Logic" colour="210">
            <block type="controls_if"></block>
          </category>
          <category name="Loops" colour="120">
            <block type="controls_repeat_ext"></block>
          </category>
        </xml>
      `,
      trashcan: true,
      grid: { spacing: 20, length: 3, snap: true },
      zoom: { controls: true, wheel: true },
    });

    workspaceRef.current = workspace;

    return () => workspace.dispose();
  }, []);

  const runCode = async () => {
    if (!workspaceRef.current) return;
    const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
    try {
      setIsRunning(true);
      await new Function(`return (async () => { ${code} })()`)();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error running code");
    } finally {
      setIsRunning(false);
    }
  };

  const stopCode = () => toast("Stopped manually");

  const saveWorkspace = () => {
    if (!workspaceRef.current) return;
    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
    localStorage.setItem("wedo_workspace", Blockly.Xml.domToText(xml));
    toast.success("Workspace saved");
  };

  const loadWorkspace = () => {
    if (!workspaceRef.current) return;
    const xmlText = localStorage.getItem("wedo_workspace");
    if (!xmlText) return;
    const xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
    toast.success("Workspace loaded");
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={saveWorkspace} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button onClick={loadWorkspace} variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" /> Load
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-success hover:bg-success/90 text-white"
          >
            <Play className="w-4 h-4 mr-2" /> Run
          </Button>
          <Button onClick={stopCode} disabled={!isRunning} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> Stop
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
