import { useEffect, useRef, useState } from "react";
import { Play, Square, AlertCircle, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const stopRequestedRef = useRef(false);
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Custom theme for dark mode
  const customTheme = Blockly.Theme.defineTheme('customTheme', {
    'base': Blockly.Themes.Classic,
    'componentStyles': {
      'workspaceBackgroundColour': theme === 'dark' ? '#1f2937' : '#f3f4f6',
      'toolboxBackgroundColour': theme === 'dark' ? '#111827' : '#ffffff',
      'toolboxForegroundColour': theme === 'dark' ? '#f9fafb' : '#111827',
      'flyoutBackgroundColour': theme === 'dark' ? '#374151' : '#e5e7eb',
      'flyoutForegroundColour': theme === 'dark' ? '#f9fafb' : '#111827',
      'flyoutOpacity': 1,
      'scrollbarColour': theme === 'dark' ? '#4b5563' : '#9ca3af',
      'scrollbarOpacity': 0.8,
      'insertionMarkerColour': '#059669',
      'insertionMarkerOpacity': 0.8,
      'cursorColour': '#f9fafb',
      'selectedEntityColour': '#93c5fd',
      'selectedEntityOpacity': 0.8,
    }
  });

   useEffect(() => {
    if (!blocklyDiv.current) return;

    // Multilingual block labels
    const getBlockLabels = () => {
      if (language === 'kk') {
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
          tiltAngle: "еңкею бұрышы"
        };
      } else if (language === 'ru') {
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
          tiltAngle: "угол наклона"
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
          tiltAngle: "tilt angle"
        };
      }
    };

    const labels = getBlockLabels();

    // Define custom blocks with multilingual support
    Blockly.Blocks["wedo_motor_run"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.motorOn)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.motor, "motor"],
            ]),
            "TYPE"
          )
          .appendField(labels.on)
          .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
          .appendField(labels.seconds);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(65);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_motor_reverse"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.motorOff)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.motor, "motor"],
            ]),
            "TYPE"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(65);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_motor_stop_brake"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.setPower)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.motor, "motor"],
            ]),
            "TYPE"
          )
          .appendField(labels.to)
          .appendField(new Blockly.FieldNumber(100, 0, 100), "POWER");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(65);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_motor_stop_coast"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.setDirection)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.motor, "motor"],
            ]),
            "TYPE"
          )
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
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_motor_toggle"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.setLedColor)
          .appendField(new Blockly.FieldNumber(50, 0, 100), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_motor_for_seconds"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.motorOn)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.motor, "motor"],
            ]),
            "TYPE"
          )
          .appendField(labels.on)
          .appendField(new Blockly.FieldNumber(1, 0, 10), "SECONDS")
          .appendField(labels.seconds);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(65);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_sensor_motion"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.whenDistance)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.lessThan, "less"],
              [labels.greaterThan, "greater"],
            ]),
            "OPERATOR"
          )
          .appendField(new Blockly.FieldNumber(50, 0, 100), "VALUE");
        this.setOutput(true, "Boolean");
        this.setColour(175);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_sensor_tilt"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.whenTilted)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.any, "any"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "Boolean");
        this.setColour(175);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_sensor_light"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.distance);
        this.setOutput(true, "Number");
        this.setColour(175);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_sensor_button"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.tilted)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.any, "any"],
              ["?", "unknown"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "String");
        this.setColour(175);
        this.setTooltip("");
      },
    };

    Blockly.Blocks["wedo_led_color"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(labels.tiltAngle)
          .appendField(
            new Blockly.FieldDropdown([
              [labels.forward, "up"],
              [labels.backward, "down"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "String");
        this.setColour(20);
        this.setTooltip("");
      },
    };

    // Generators
    Blockly.JavaScript["wedo_motor_run"] = function (block: any) {
      const power = block.getFieldValue("POWER");
      return `await wedo.runMotor(${power});\n`;
    };

    Blockly.JavaScript["wedo_motor_reverse"] = function (block: any) {
      const power = block.getFieldValue("POWER");
      return `await wedo.runMotorReverse(${power});\n`;
    };

    Blockly.JavaScript["wedo_motor_stop_brake"] = function () {
      return `await wedo.stopMotorBrake();\n`;
    };

    Blockly.JavaScript["wedo_motor_stop_coast"] = function () {
      return `await wedo.stopMotorCoast();\n`;
    };

    Blockly.JavaScript["wedo_motor_toggle"] = function () {
      return `await wedo.toggleDirection();\n`;
    };

    Blockly.JavaScript["wedo_motor_for_seconds"] = function (block: any) {
      const power = block.getFieldValue("POWER");
      const seconds = block.getFieldValue("SECONDS");
      return `await wedo.runMotorForSeconds(${power}, ${seconds});\n`;
    };

    Blockly.JavaScript["wedo_sensor_motion"] = function () {
      return [`wedo.getMotion()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_sensor_tilt"] = function () {
      return [`wedo.getTilt()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_sensor_light"] = function () {
      return [`wedo.getDistance()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_sensor_button"] = function () {
      return [`wedo.getTilt()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_led_color"] = function (block: any) {
      const color = block.getFieldValue("COLOR");
      return `await wedo.setLedColor(${color});\n`;
    };

    // Toolbox XML
    const toolbox = `
      <xml id="toolbox" style="display: none">
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
            <value name="TIMES">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
          </block>
          <block type="time_delay">
            <value name="DELAY_TIME">
              <shadow type="math_number">
                <field name="NUM">1</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="${t("blocks.logic")}" colour="210">
          <block type="logic_compare"></block>
          <block type="logic_operation"></block>
          <block type="logic_negate"></block>
          <block type="logic_boolean"></block>
        </category>
        <category name="${t("blocks.math")}" colour="230">
          <block type="math_number"></block>
          <block type="math_arithmetic"></block>
          <block type="math_single"></block>
        </category>
      </xml>
    `;

    // Inject Blockly
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: theme === 'dark' ? '#1a1a1a' : '#e0e0e0',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      theme: customTheme,
    });

    workspaceRef.current = workspace;

    return () => {
      if (workspace) {
        workspace.dispose();
      }
    };
  }, [language, theme]);

  // Auto-load workspace on mount
  useEffect(() => {
    if (!workspaceRef.current) return;

    const xmlText = localStorage.getItem("wedo_workspace");
    if (xmlText) {
      try {
        const xml = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (error) {
        console.error("Failed to load workspace:", error);
      }
    }
  }, []);

  const runCode = async () => {
    if (!workspaceRef.current) return;

    const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
    // ...
  };

  const stopCode = () => {
    // ...
  };

  const saveWorkspace = () => {
    // ...
  };

  const loadWorkspace = () => {
    // ...
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={saveWorkspace} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            {t("control.save")}
          </Button>
          <Button onClick={loadWorkspace} variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            {t("control.load")}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={runCode} disabled={isRunning} className="bg-success hover:bg-success/90 text-white">
            <Play className="w-4 h-4 mr-2" />
            {t("control.run")}
          </Button>
          <Button onClick={stopCode} disabled={!isRunning} variant="destructive">
            <Square className="w-4 h-4 mr-2" />
            {t("control.stop")}
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
