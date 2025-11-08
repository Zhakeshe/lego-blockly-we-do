import { useEffect, useRef, useState } from "react";
import { Play, Square, AlertCircle, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();

  useEffect(() => {
    if (!blocklyDiv.current) return;
    
    // Wait for Blockly to load
    if (typeof window !== 'undefined' && !(window as any).Blockly) {
      console.log("Waiting for Blockly to load...");
      const checkBlockly = setInterval(() => {
        if ((window as any).Blockly) {
          clearInterval(checkBlockly);
          window.location.reload();
        }
      }, 100);
      return () => clearInterval(checkBlockly);
    }
    
    const Blockly = (window as any).Blockly;
    if (!Blockly) return;

    // Define custom blocks
    Blockly.Blocks["wedo_motor_run"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("включить")
          .appendField(
            new Blockly.FieldDropdown([
              ["мотор", "motor"],
            ]),
            "TYPE"
          )
          .appendField("на")
          .appendField(new Blockly.FieldNumber(1, 0, 100), "POWER")
          .appendField("секунду");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Включить мотор на указанное время");
      },
    };

    Blockly.Blocks["wedo_motor_reverse"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("выключить")
          .appendField(
            new Blockly.FieldDropdown([
              ["мотор", "motor"],
            ]),
            "TYPE"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Выключить мотор");
      },
    };

    Blockly.Blocks["wedo_motor_stop_brake"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("установить мощность")
          .appendField(
            new Blockly.FieldDropdown([
              ["мотор", "motor"],
            ]),
            "TYPE"
          )
          .appendField("в")
          .appendField(new Blockly.FieldNumber(100, 0, 100), "POWER");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Установить мощность мотора");
      },
    };

    Blockly.Blocks["wedo_motor_stop_coast"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("установить направление")
          .appendField(
            new Blockly.FieldDropdown([
              ["мотор", "motor"],
            ]),
            "TYPE"
          )
          .appendField("в")
          .appendField(
            new Blockly.FieldDropdown([
              ["сюда ⇾", "forward"],
              ["туда ⇽", "reverse"],
            ]),
            "DIRECTION"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Установить направление мотора");
      },
    };

    Blockly.Blocks["wedo_motor_toggle"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("установить цвет лампочки")
          .appendField(new Blockly.FieldNumber(50, 0, 100), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Установить цвет лампочки");
      },
    };

    Blockly.Blocks["wedo_motor_for_seconds"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("включить")
          .appendField(
            new Blockly.FieldDropdown([
              ["мотор", "motor"],
            ]),
            "TYPE"
          )
          .appendField("на")
          .appendField(new Blockly.FieldNumber(1, 0, 100), "POWER")
          .appendField("секунду");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Включить мотор на указанное время");
      },
    };

    Blockly.Blocks["wedo_sensor_motion"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("когда расстояние")
          .appendField(
            new Blockly.FieldDropdown([
              ["<", "less"],
              [">", "greater"],
            ]),
            "OPERATOR"
          )
          .appendField(new Blockly.FieldNumber(50, 0, 100), "VALUE");
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("Проверить расстояние от датчика");
      },
    };

    Blockly.Blocks["wedo_sensor_tilt"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("когда наклонен")
          .appendField(
            new Blockly.FieldDropdown([
              ["любая", "any"],
              ["↑", "up"],
              ["↓", "down"],
              ["←", "left"],
              ["→", "right"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("Проверить наклон датчика");
      },
    };

    Blockly.Blocks["wedo_sensor_light"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("расстояние");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Получить расстояние от датчика");
      },
    };

    Blockly.Blocks["wedo_sensor_button"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("наклонен")
          .appendField(
            new Blockly.FieldDropdown([
              ["любая", "any"],
              ["?", "unknown"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Проверить наклон");
      },
    };

    Blockly.Blocks["wedo_led_color"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("угол наклона")
          .appendField(
            new Blockly.FieldDropdown([
              ["вверх", "up"],
              ["вниз", "down"],
            ]),
            "DIRECTION"
          );
        this.setOutput(true, "String");
        this.setColour(20);
        this.setTooltip("Получить угол наклона");
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

    // Initialize workspace with proper toolbox configuration
    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "WeDo Моторлар / Motors",
          colour: "230",
          contents: [
            { kind: "block", type: "wedo_motor_run" },
            { kind: "block", type: "wedo_motor_reverse" },
            { kind: "block", type: "wedo_motor_stop_brake" },
            { kind: "block", type: "wedo_motor_stop_coast" },
            { kind: "block", type: "wedo_motor_toggle" },
            { kind: "block", type: "wedo_motor_for_seconds" },
          ],
        },
        {
          kind: "category",
          name: "WeDo Сенсорлар / Sensors",
          colour: "160",
          contents: [
            { kind: "block", type: "wedo_sensor_motion" },
            { kind: "block", type: "wedo_sensor_tilt" },
            { kind: "block", type: "wedo_sensor_light" },
            { kind: "block", type: "wedo_sensor_button" },
          ],
        },
        {
          kind: "category",
          name: "WeDo Hub",
          colour: "20",
          contents: [
            { kind: "block", type: "wedo_led_color" },
            { kind: "block", type: "wedo_wait" },
          ],
        },
        {
          kind: "category",
          name: "Басқару / Control",
          colour: "120",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "controls_repeat_ext" },
            { kind: "block", type: "controls_whileUntil" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_negate" },
          ],
        },
        {
          kind: "category",
          name: "Математика / Math",
          colour: "210",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_single" },
          ],
        },
        {
          kind: "category",
          name: "Айнымалылар / Variables",
          colour: "330",
          custom: "VARIABLE",
        },
      ],
    };

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
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
      theme: Blockly.Themes.Dark,
    });

    workspaceRef.current = workspace;

    return () => {
      workspace.dispose();
    };
  }, []);

  const runCode = async () => {
    if (!workspaceRef.current) return;

    const Blockly = (window as any).Blockly;
    if (!Blockly) {
      toast.error(t("error.blocklyNotLoaded"));
      return;
    }

    if (wedo.status !== "Connected") {
      toast.error(t("error.notConnected"), {
        description: t("control.connect"),
        duration: 4000,
      });
      return;
    }

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
        toast.success(t("success.programComplete"));
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
    toast.info(t("info.programStopped"));
  };

  const saveWorkspace = () => {
    if (!workspaceRef.current) return;
    const Blockly = (window as any).Blockly;
    if (!Blockly) return;

    const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
    const xmlText = Blockly.Xml.domToText(xml);
    localStorage.setItem("wedo_workspace", xmlText);
    toast.success(t("success.saved"));
  };

  const loadWorkspace = () => {
    if (!workspaceRef.current) return;
    const Blockly = (window as any).Blockly;
    if (!Blockly) return;

    const xmlText = localStorage.getItem("wedo_workspace");
    if (!xmlText) {
      toast.error(t("error.noSavedProgram"));
      return;
    }

    try {
      const xml = Blockly.utils.xml.textToDom(xmlText);
      workspaceRef.current.clear();
      Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      toast.success(t("success.loaded"));
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text1">{t("workspace.title")}</h2>
        <div className="flex gap-2">
          <Button onClick={saveWorkspace} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            {t("control.save")}
          </Button>
          <Button onClick={loadWorkspace} variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            {t("control.load")}
          </Button>
          {!isRunning ? (
            <Button
              onClick={runCode}
              className="bg-success hover:bg-success/80 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {t("control.run")}
            </Button>
          ) : (
            <Button onClick={stopCode} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              {t("control.stop")}
            </Button>
          )}
        </div>
      </div>

      {wedo.status !== "Connected" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-info/10 border border-info/30 rounded-lg text-info text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t("workspace.info")}</span>
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
