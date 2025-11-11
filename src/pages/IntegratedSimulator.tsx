import React, { useState, useEffect } from 'react';
import Scene3D from '../components/3d/Scene3D';
import BlocklyEditor3D from '../components/blockly/BlocklyEditor3D';
import { useRobot3D } from '../contexts/Robot3DContext';
import { Map, Project } from '../types';
import { mapService } from '../services/mapService';
import { projectService } from '../services/projectService';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Save, FolderOpen } from 'lucide-react';

const IntegratedSimulator: React.FC = () => {
  const { robotConfig, setRobotConfig } = useRobot3D();
  const [selectedMap, setSelectedMap] = useState<Map | undefined>();
  const [maps, setMaps] = useState<Map[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sensorData, setSensorData] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('3d');
  const { toast } = useToast();

  useEffect(() => {
    loadMaps();
    loadProjects();
    initializeRobot();
  }, []);

  const initializeRobot = () => {
    // Initialize robot with default configuration
    setRobotConfig({
      chassis: {
        type: 'default',
        color: '#0066cc',
      },
      motors: [
        {
          id: 'motorA',
          type: 'motor',
          position: { x: -0.5, y: 0.5, z: 0.5 },
          power: 0,
        },
        {
          id: 'motorB',
          type: 'motor',
          position: { x: 0.5, y: 0.5, z: 0.5 },
          power: 0,
        },
      ],
      sensors: [
        {
          id: 'sensor1',
          type: 'distance',
          position: { x: 0, y: 0.5, z: 0.75 },
          range: 10,
          value: 0,
        },
      ],
      wheels: [
        {
          id: 'wheel1',
          position: { x: -0.6, y: 0.3, z: 0.5 },
          radius: 0.3,
        },
        {
          id: 'wheel2',
          position: { x: 0.6, y: 0.3, z: 0.5 },
          radius: 0.3,
        },
      ],
    });
  };

  const loadMaps = async () => {
    try {
      const response = await mapService.getMaps(1, 20);
      setMaps(response.data);
      if (response.data.length > 0) {
        setSelectedMap(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load maps:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects(1, 20);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSensorUpdate = (sensorId: string, value: number) => {
    setSensorData((prev) => ({ ...prev, [sensorId]: value }));
  };

  const handleSaveWorkspace = async (workspace: string, code: string) => {
    try {
      if (currentProject) {
        // Update existing project
        await projectService.updateProject(currentProject._id, {
          blocklyWorkspace: workspace,
          robot3DConfig: robotConfig,
          mapId: selectedMap?._id,
        });
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
      } else {
        // Create new project
        const project = await projectService.createProject({
          name: `Project ${new Date().toLocaleString()}`,
          description: 'Created from simulator',
          blocklyWorkspace: workspace,
          robot3DConfig: robotConfig,
          mapId: selectedMap?._id,
        });
        setCurrentProject(project);
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
      }
      loadProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await projectService.getProjectById(projectId);
      setCurrentProject(project);
      setRobotConfig(project.robot3DConfig);
      if (project.mapId) {
        const map = maps.find((m) => m._id === project.mapId);
        if (map) setSelectedMap(map);
      }
      toast({
        title: 'Success',
        description: 'Project loaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load project',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 bg-background border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {currentProject ? currentProject.name : 'Integrated Simulator'}
          </h1>
          <div className="flex gap-4 items-center">
            <Select
              value={currentProject?._id || ''}
              onValueChange={handleLoadProject}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Load project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMap?._id}
              onValueChange={(value) => {
                const map = maps.find((m) => m._id === value);
                setSelectedMap(map);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select map" />
              </SelectTrigger>
              <SelectContent>
                {maps.map((map) => (
                  <SelectItem key={map._id} value={map._id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Blockly/3D Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="3d">3D Simulator</TabsTrigger>
              <TabsTrigger value="blockly">Blockly Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="3d" className="flex-1 m-0">
              <Scene3D map={selectedMap} onSensorUpdate={handleSensorUpdate} />
            </TabsContent>
            <TabsContent value="blockly" className="flex-1 m-0">
              <BlocklyEditor3D
                onSave={handleSaveWorkspace}
                initialWorkspace={currentProject?.blocklyWorkspace}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Robot Info */}
        <div className="w-80 p-4 bg-background border-l overflow-y-auto">
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Robot Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motors:</span>
                <span>{robotConfig.motors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensors:</span>
                <span>{robotConfig.sensors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wheels:</span>
                <span>{robotConfig.wheels.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Motor Power</h3>
            {robotConfig.motors.map((motor) => (
              <div key={motor.id} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{motor.id}</span>
                  <span>{motor.power || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.abs(motor.power || 0)}%`,
                      backgroundColor: (motor.power || 0) < 0 ? '#ef4444' : '#3b82f6',
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Sensor Data</h3>
            {robotConfig.sensors.map((sensor) => (
              <div key={sensor.id} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{sensor.id}</span>
                  <span className="text-muted-foreground">{sensor.type}</span>
                </div>
                <div className="mt-1 text-lg font-mono">
                  {(sensorData[sensor.id] || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegratedSimulator;
