import { useEffect, useRef, useState } from "react";
import { Play, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { toast } from "sonner";

declare const Blockly: any;

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    if (!blocklyDiv.current || !Blockly) return;

    // Define custom blocks
    Blockly.Blocks["wedo_motor_run"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Run motor at")
          .appendField(new Blockly.FieldNumber(50, 0, 100), "POWER")
          .appendField("% power");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Run the motor at specified power (0-100%)");
      },
    };

    Blockly.Blocks["wedo_motor_reverse"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Run motor reverse at")
          .appendField(new Blockly.FieldNumber(50, 0, 100), "POWER")
          .appendField("% power");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Run the motor in reverse");
      },
    };

    Blockly.Blocks["wedo_motor_stop_brake"] = {
      init: function () {
        this.appendDummyInput().appendField("Stop motor (Brake)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Stop the motor with braking");
      },
    };

    Blockly.Blocks["wedo_motor_stop_coast"] = {
      init: function () {
        this.appendDummyInput().appendField("Stop motor (Coast)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Stop the motor freely");
      },
    };

    Blockly.Blocks["wedo_motor_toggle"] = {
      init: function () {
        this.appendDummyInput().appendField("Toggle motor direction");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Reverse motor direction");
      },
    };

    Blockly.Blocks["wedo_motor_for_seconds"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Run motor at")
          .appendField(new Blockly.FieldNumber(50, 0, 100), "POWER")
          .appendField("% for")
          .appendField(new Blockly.FieldNumber(2, 0), "SECONDS")
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Run motor for specified time");
      },
    };

    Blockly.Blocks["wedo_sensor_motion"] = {
      init: function () {
        this.appendDummyInput().appendField("Motion sensor value");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Get current motion sensor reading");
      },
    };

    Blockly.Blocks["wedo_sensor_tilt"] = {
      init: function () {
        this.appendDummyInput().appendField("Tilt sensor state");
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Get tilt state (forward/back/left/right/none)");
      },
    };

    Blockly.Blocks["wedo_sensor_light"] = {
      init: function () {
        this.appendDummyInput().appendField("Light level (0-100)");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Get light sensor reading");
      },
    };

    Blockly.Blocks["wedo_sensor_button"] = {
      init: function () {
        this.appendDummyInput().appendField("Hub button pressed?");
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("Check if hub button is pressed");
      },
    };

    Blockly.Blocks["wedo_led_color"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Set LED to")
          .appendField(
            new Blockly.FieldDropdown([
              ["Off", "off"],
              ["White", "white"],
              ["Red", "red"],
              ["Green", "green"],
              ["Blue", "blue"],
              ["Yellow", "yellow"],
              ["Purple", "purple"],
              ["Cyan", "cyan"],
            ]),
            "COLOR"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Change hub LED color");
      },
    };

    Blockly.Blocks["wedo_wait"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Wait")
          .appendField(new Blockly.FieldNumber(1000, 0), "MS")
          .appendField("milliseconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Wait for specified milliseconds");
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
      return [`wedo.getLight()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_sensor_button"] = function () {
      return [`wedo.getHubButton()`, Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.JavaScript["wedo_led_color"] = function (block: any) {
      const color = block.getFieldValue("COLOR");
      return `await wedo.setHubLed("${color}");\n`;
    };

    Blockly.JavaScript["wedo_wait"] = function (block: any) {
      const ms = block.getFieldValue("MS");
      return `await new Promise(resolve => setTimeout(resolve, ${ms}));\n`;
    };

    // Initialize workspace
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: `
        <xml>
          <category name="WeDo Motors" colour="230">
            <block type="wedo_motor_run"></block>
            <block type="wedo_motor_reverse"></block>
            <block type="wedo_motor_stop_brake"></block>
            <block type="wedo_motor_stop_coast"></block>
            <block type="wedo_motor_toggle"></block>
            <block type="wedo_motor_for_seconds"></block>
          </category>
          <category name="WeDo Sensors" colour="160">
            <block type="wedo_sensor_motion"></block>
            <block type="wedo_sensor_tilt"></block>
            <block type="wedo_sensor_light"></block>
            <block type="wedo_sensor_button"></block>
          </category>
          <category name="WeDo Hub" colour="20">
            <block type="wedo_led_color"></block>
            <block type="wedo_wait"></block>
          </category>
          <category name="Control" colour="120">
            <block type="controls_if"></block>
            <block type="controls_repeat_ext"></block>
            <block type="controls_whileUntil"></block>
          </category>
          <category name="Math" colour="210">
            <block type="math_number"></block>
            <block type="math_arithmetic"></block>
            <block type="logic_compare"></block>
          </category>
          <category name="Variables" colour="330" custom="VARIABLE"></category>
        </xml>
      `,
      grid: {
        spacing: 20,
        length: 3,
        colour: "#1a1a1a",
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
    });

    workspaceRef.current = workspace;

    return () => {
      workspace.dispose();
    };
  }, []);

  const runCode = async () => {
    if (wedo.status !== "Connected") {
      toast.error("Please connect to WeDo device first");
      return;
    }

    if (!workspaceRef.current) return;

    try {
      setIsRunning(true);
      stopRequestedRef.current = false;

      const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
      const asyncCode = `
        (async function() {
          const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          ${code}
        })();
      `;

      // Execute code
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const program = new AsyncFunction("wedo", asyncCode);
      await program(wedo);

      if (!stopRequestedRef.current) {
        toast.success("Program completed");
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
      console.error("Execution error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const stopCode = async () => {
    stopRequestedRef.current = true;
    setIsRunning(false);
    await wedo.stopMotorBrake();
    toast.info("Program stopped");
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text1">Visual Editor</h2>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={runCode}
              disabled={wedo.status !== "Connected"}
              className="bg-success hover:bg-success/80 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
          ) : (
            <Button onClick={stopCode} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {wedo.status !== "Connected" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Connect to WeDo device to run programs</span>
        </div>
      )}

      <div
        ref={blocklyDiv}
        className="flex-1 bg-surface1 border border-dashed border-border1 rounded-lg overflow-hidden"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
};
