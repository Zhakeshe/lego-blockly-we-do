import { useEffect, useRef, useState } from "react";
import { Play, Square, AlertCircle, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useTheme } from "next-themes";

declare const Blockly: any;

interface BlocklyWorkspaceProps {
  wedo: WeDoHook;
}

export const BlocklyWorkspace = ({ wedo }: BlocklyWorkspaceProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState(false);
  const stopRequestedRef = useRef(false);
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Wait for Blockly to load
  useEffect(() => {
    const checkBlockly = () => {
      if (typeof window !== 'undefined' && (window as any).Blockly) {
        setBlocklyLoaded(true);
      }
    };
    
    checkBlockly();
    
    if (!blocklyLoaded) {
      const interval = setInterval(checkBlockly, 100);
      return () => clearInterval(interval);
    }
  }, [blocklyLoaded]);

  useEffect(() => {
    if (!blocklyDiv.current || !blocklyLoaded) return;
    
    const Blockly = (window as any).Blockly;
    if (!Blockly) return;

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

    // Get category names based on language
    const getCategoryNames = () => {
      if (language === 'kk') {
        return {
          motors: "Қозғалтқыштар",
          sensors: "Сенсорлар",
          control: "Басқару",
          looks: "Көрініс"
        };
      } else if (language === 'ru') {
        return {
          motors: "Моторы", 
          sensors: "Сенсоры",
          control: "Управление",
          looks: "Внешность"
        };
      } else {
        return {
          motors: "Motors",
          sensors: "Sensors", 
          control: "Control",
          looks: "Looks"
        };
      }
    };

    const categoryNames = getCategoryNames();

    // Initialize workspace with proper toolbox configuration
    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: categoryNames.motors,
          colour: "65",
          contents: [
            { kind: "block", type: "wedo_motor_run" },
            { kind: "block", type: "wedo_motor_reverse" },
            { kind: "block", type: "wedo_motor_stop_brake" },
            { kind: "block", type: "wedo_motor_stop_coast" },
          ],
        },
        {
          kind: "category",
          name: categoryNames.sensors,
          colour: "175",
          contents: [
            { kind: "block", type: "wedo_sensor_motion" },
            { kind: "block", type: "wedo_sensor_tilt" },
            { kind: "block", type: "wedo_sensor_light" },
            { kind: "block", type: "wedo_sensor_button" },
          ],
        },
        {
          kind: "category",
          name: categoryNames.looks,
          colour: "20",
          contents: [
            { kind: "block", type: "wedo_motor_toggle" },
            { kind: "block", type: "wedo_led_color" },
          ],
        },
        {
          kind: "category",
          name: categoryNames.control,
          colour: "120",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "controls_repeat_ext" },
          ],
        },
      ],
    };

    // Create custom theme
    const customTheme = Blockly.Theme.defineTheme('custom', {
      base: theme === 'dark' ? Blockly.Themes.Dark : Blockly.Themes.Classic,
      categoryStyles: {
        motors_category: {
          colour: '65',
        },
        sensors_category: {
          colour: '175',
        },
        looks_category: {
          colour: '20',
        },
        control_category: {
          colour: '120',
        },
      },
    });

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
  }, [blocklyLoaded, language, theme]);

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
    
    // Save to current project if exists
    const currentProjectId = localStorage.getItem("current_project_id");
    if (currentProjectId) {
      const projectsData = localStorage.getItem("wedo_projects");
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const projectIndex = projects.findIndex((p: any) => p.id === currentProjectId);
        if (projectIndex !== -1) {
          projects[projectIndex].workspace = xmlText;
          projects[projectIndex].modified = new Date().toISOString();
          localStorage.setItem("wedo_projects", JSON.stringify(projects));
        }
      }
    }
    
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

  // Auto-load workspace on mount
  useEffect(() => {
    if (!workspaceRef.current || !blocklyLoaded) return;
    
    const Blockly = (window as any).Blockly;
    if (!Blockly) return;

    const xmlText = localStorage.getItem("wedo_workspace");
    if (xmlText) {
      try {
        const xml = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (error) {
        console.error("Failed to load workspace:", error);
      }
    }
  }, [blocklyLoaded]);

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
