import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { defineCustomBlocks, defineCodeGenerators } from './CustomBlocks';
import { toolboxConfig } from './toolbox';
import { CodeExecutor } from './CodeExecutor';
import { useRobot3D } from '../../contexts/Robot3DContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Play, Square, Code, Save } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface BlocklyEditor3DProps {
  onSave?: (workspace: string, code: string) => void;
  initialWorkspace?: string;
}

const BlocklyEditor3D: React.FC<BlocklyEditor3DProps> = ({ onSave, initialWorkspace }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const executorRef = useRef<CodeExecutor | null>(null);
  const { updateMotorPower, getSensorValue } = useRobot3D();
  const { toast } = useToast();

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Define custom blocks and generators
    defineCustomBlocks();
    defineCodeGenerators();

    // Create workspace
    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: toolboxConfig,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
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

    setWorkspace(ws);

    // Load initial workspace if provided
    if (initialWorkspace) {
      try {
        const xml = Blockly.utils.xml.textToDom(initialWorkspace);
        Blockly.Xml.domToWorkspace(xml, ws);
      } catch (error) {
        console.error('Failed to load workspace:', error);
      }
    }

    // Create code executor
    executorRef.current = new CodeExecutor(updateMotorPower, getSensorValue);

    // Listen to workspace changes
    ws.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(ws);
      setGeneratedCode(code);
    });

    return () => {
      ws.dispose();
    };
  }, []);

  const handleRun = async () => {
    if (!executorRef.current || !generatedCode) {
      toast({
        title: 'Error',
        description: 'No code to execute',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);

    try {
      await executorRef.current.execute(generatedCode);
      toast({
        title: 'Success',
        description: 'Code executed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Execution Error',
        description: error.message || 'Failed to execute code',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    if (executorRef.current) {
      executorRef.current.stop();
      setIsExecuting(false);
      toast({
        title: 'Stopped',
        description: 'Code execution stopped',
      });
    }
  };

  const handleSave = () => {
    if (!workspace) return;

    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);

    onSave?.(xmlText, generatedCode);

    toast({
      title: 'Saved',
      description: 'Workspace saved successfully',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 bg-background border-b flex items-center gap-2">
        <Button
          onClick={handleRun}
          disabled={isExecuting || !generatedCode}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Run
        </Button>
        <Button
          onClick={handleStop}
          disabled={!isExecuting}
          variant="destructive"
          className="gap-2"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
        <Button
          onClick={() => setShowCode(!showCode)}
          variant="outline"
          className="gap-2"
        >
          <Code className="h-4 w-4" />
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          className="gap-2 ml-auto"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Blockly Workspace and Code View */}
      <div className="flex-1 flex">
        <div
          ref={blocklyDiv}
          className={`${showCode ? 'w-1/2' : 'w-full'} h-full`}
        />
        {showCode && (
          <Card className="w-1/2 m-4 p-4 overflow-auto">
            <h3 className="font-semibold mb-2">Generated Code</h3>
            <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
              <code>{generatedCode || '// No code generated yet'}</code>
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlocklyEditor3D;
