import { useEffect, useRef, useState } from "react";
import { Play, Square, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import * as Blockly from "blockly/core";
import 'blockly/blocks';       // block definitions
import 'blockly/javascript';   // JS generator

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

// Flag to ensure blocks are defined only once
let blocksDefined = false;

// Multilingual block labels
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
      whenDistance: "қашықтық болғанда",
      lessThan: "<",
      greaterThan: ">",
      whenTilted: "еңкейгенде",
      any: "кез келген",
      distance: "қашықтық",
      tilted: "еңкейген",
      tiltAngle: "еңкею бұрышы",
    };
  } else if (language === "ru") {
    return {
      motorOn: "включить",
      motorOff: "выключить",
      motorPower: "установить мощность",
      motorDirection: "установить направление",
      motor: "мотор",
      on: "на",
      seconds: "секунду",
      setPower: "установить мощность",
      to: "в",
      setDirection: "установить направление",
      forward: "сюда ⇾",
      backward: "туда ⇽",
      setLedColor: "установить цвет лампочки",
      whenDistance: "когда расстояние",
      lessThan: "<",
      greaterThan: ">",
      whenTilted: "когда наклонен",
      any: "любая",
      distance: "расстояние",
      tilted: "наклонен",
      tiltAngle: "угол наклона",
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
      whenDistance: "when distance",
      lessThan: "<",
      greaterThan: ">",
      whenTilted: "when tilted",
      any: "any",
      distance: "distance",
      tilted: "tilted",
      tiltAngle: "tilt angle",
    };
  }
};

// Define custom blocks and generators
const defineCustomBlocks = (wedo: WeDoHook) => {
  if (blocksDefined) return;
  blocksDefined = true;

  const labels = getBlockLabels("en"); // Default labels for block fields

  // Motor Blocks
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

  Blockly.Blocks["wedo_motor_reverse"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.motorOff)
        .appendField(new Blockly.FieldDropdown([[labels.motor, "motor"]]), "TYPE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_stop_brake"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.setPower)
        .appendField(new Blockly.FieldDropdown([[labels.motor, "motor"]]), "TYPE")
        .appendField(labels.to)
        .appendField(new Blockly.FieldNumber(100, 0, 100), "POWER");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_stop_coast"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.setDirection)
        .appendField(new Blockly.FieldDropdown([[labels.motor, "motor"]]), "TYPE")
        .appendField(labels.to)
        .appendField(
          new Blockly.FieldDropdown([
            [labels.forward, "forward"],
            [labels.backward, "backward"],
          ]),
          "DIRECTION"
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
    },
  };

  Blockly.Blocks["wedo_motor_for_seconds"] = {
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

  // Sensor Blocks
  Blockly.Blocks["wedo_sensor_motion"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.whenDistance)
        .appendField(new Blockly.FieldDropdown([[labels.lessThan, "less"], [labels.greaterThan, "greater"]]), "OPERATOR")
        .appendField(new Blockly.FieldNumber(50, 0, 100), "VALUE");
      this.setOutput(true, "Boolean");
      this.setColour(175);
    },
  };

  Blockly.Blocks["wedo_sensor_tilt"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.whenTilted)
        .appendField(new Blockly.FieldDropdown([[labels.any, "any"]]), "DIRECTION");
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
        .appendField(new Blockly.FieldDropdown([[labels.any, "any"], ["?", "unknown"]]), "DIRECTION");
      this.setOutput(true, "String");
      this.setColour(175);
    },
  };

  Blockly.Blocks["wedo_led_color"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(labels.tiltAngle)
        .appendField(new Blockly.FieldDropdown([[labels.forward, "up"], [labels.backward, "down"]]), "DIRECTION");
      this.setOutput(true, "String");
      this.setColour(20);
    },
  };

  // Generators
  Blockly.JavaScript["wedo_motor_run"] = (block: any) => `await wedo.runMotor(100);\n`;
  Blockly.JavaScript["wedo_motor_reverse"] = (block: any) => `await wedo.runMotorReverse(100);\n`;
  Blockly.JavaScript["wedo_motor_stop_brake"] = () => `await wedo.stopMotorBrake();\n`;
  Blockly.JavaScript["wedo_motor_stop_coast"] = () => `await wedo.stopMotorCoast();\n`;
  Blockly.JavaScript["wedo_motor_for_seconds"] = (block: any) => `await wedo.runMotorForSeconds(100, 1);\n`;
  Blockly.JavaScript["wedo_sensor_motion"] = () => ["wedo.getMotion()", Blockly.JavaScript.ORDER_ATOMIC];
  Blockly.JavaScript["wedo_sensor_tilt"] = () => ["wedo.getTilt()", Blockly.JavaScript.ORDER_ATOMIC];
  Blockly.JavaScript["wedo_sensor_light"] = () => ["wedo.getDistance()", Blockly.JavaScript.ORDER_ATOMIC];
  Blockly.JavaScript["wedo_sensor_button"] = () => ["wedo.getTilt()", Blockly.JavaScript.ORDER_ATOMIC];
  Blockly.JavaScript["wedo_led_color"] = (block: any) => `await wedo.setLedColor(50);\n`;
};

export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // Define blocks once
  useEffect(() => {
    defineCustomBlocks(wedo);
  }, [wedo]);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    const labels = getBlockLabels(language);

    const toolbox = `
      <xml style="display: none">
        <category name="${t("blocks.motor")}" colour="65">
          <block type="wedo_motor_run"></block>
          <block type="wedo_motor_reverse"></block>
          <block type="wedo_motor_stop_brake"></block>
          <block type="wedo_motor_stop_coast"></block>
          <block type="wedo_motor_for_seconds"></block>
        </category>
        <category name="${t("blocks.sensor")}" colour="175">
          <block type="wedo_sensor_motion"></block>
          <block type="wedo_sensor_tilt"></block>
          <block type="wedo_sensor_light"></block>
          <block type="wedo_sensor_button"></block>
        </category>
        <category name="${t("blocks.look")}" colour="20">
          <block type="wedo_led_color"></block>
        </category>
        <category name="${t("blocks.control")}" colour="120">
          <block type="controls_if"></block>
          <block type="controls_repeat_ext">
            <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
          </block>
        </category>
      </xml>
    `;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      grid: { spacing: 20, length: 3, colour: theme === "dark" ? "#1a1a1a" : "#e0e0e0", snap: true },
      zoom: { controls: true, wheel: true, startScale: 1, maxScale: 3, minScale: 0.3 },
      trashcan: true,
    });

    workspaceRef.current = workspace;

    return () => workspace.dispose();
  }, [language, theme]);

  const runCode = async () => {
  if (!workspaceRef.current) return;
  const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
  try {
    setIsRunning(true);
    const context = { wedo }; // 👈 создаем контекст
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction("wedo", code);
    await fn(context.wedo); // 👈 передаем внутрь eval wedo
  } catch (err) {
    console.error("Error executing Blockly code:", err);
  } finally {
    setIsRunning(false);
  }
};
  const stopCode = () => {
    setIsRunning(false);
  };

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
          <Button onClick={runCode} disabled={isRunning} className="bg-success hover:bg-success/90 text-white">
            <Play className="w-4 h-4 mr-2" /> {t("control.run")}
          </Button>
          <Button onClick={stopCode} disabled={!isRunning} variant="destructive">
            <Square className="w-4 h-4 mr-2" /> {t("control.stop")}
          </Button>
        </div>
      </div>
      <div ref={blocklyDiv} className="flex-1 bg-surface1 border border-dashed border-border1 rounded-lg overflow-hidden" style={{ minHeight: "500px" }} />
    </div>
  );
};

export default BlocklyWorkspace;
