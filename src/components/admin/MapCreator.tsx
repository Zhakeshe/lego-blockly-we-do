import React, { useState } from 'react';
import { mapService } from '../../services/mapService';
import { ObstacleConfig, TerrainConfig, Vector3 } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';

const MapCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { toast } = useToast();

  const [terrain, setTerrain] = useState<TerrainConfig>({
    width: 100,
    height: 1,
    depth: 100,
    texture: 'grass',
  });

  const [obstacles, setObstacles] = useState<ObstacleConfig[]>([]);
  const [startPosition, setStartPosition] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  const addObstacle = () => {
    const newObstacle: ObstacleConfig = {
      id: `obstacle_${Date.now()}`,
      type: 'box',
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
      color: '#ff6b00',
      physics: {
        mass: 1,
        friction: 0.5,
        restitution: 0.3,
      },
    };
    setObstacles([...obstacles, newObstacle]);
  };

  const removeObstacle = (id: string) => {
    setObstacles(obstacles.filter((o) => o.id !== id));
  };

  const updateObstacle = (id: string, updates: Partial<ObstacleConfig>) => {
    setObstacles(
      obstacles.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Map name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mapService.createMap({
        name,
        description,
        terrain,
        obstacles,
        startPosition,
        isPublic,
      });

      toast({
        title: 'Success',
        description: 'Map created successfully',
      });

      // Reset form
      setName('');
      setDescription('');
      setObstacles([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create map',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Map Creator</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Map Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter map name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublic">Public (visible to all users)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Terrain */}
        <Card>
          <CardHeader>
            <CardTitle>Terrain Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={terrain.width}
                  onChange={(e) =>
                    setTerrain({ ...terrain, width: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={terrain.height}
                  onChange={(e) =>
                    setTerrain({ ...terrain, height: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Depth</Label>
                <Input
                  type="number"
                  value={terrain.depth}
                  onChange={(e) =>
                    setTerrain({ ...terrain, depth: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Texture</Label>
              <Select
                value={terrain.texture}
                onValueChange={(value) => setTerrain({ ...terrain, texture: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grass">Grass</SelectItem>
                  <SelectItem value="sand">Sand</SelectItem>
                  <SelectItem value="concrete">Concrete</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Start Position */}
        <Card>
          <CardHeader>
            <CardTitle>Robot Start Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={startPosition.x}
                  onChange={(e) =>
                    setStartPosition({ ...startPosition, x: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={startPosition.y}
                  onChange={(e) =>
                    setStartPosition({ ...startPosition, y: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Z</Label>
                <Input
                  type="number"
                  value={startPosition.z}
                  onChange={(e) =>
                    setStartPosition({ ...startPosition, z: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Obstacles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Obstacles</CardTitle>
            <Button onClick={addObstacle} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Obstacle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {obstacles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No obstacles added yet</p>
            ) : (
              obstacles.map((obstacle) => (
                <Card key={obstacle.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">{obstacle.id}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObstacle(obstacle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={obstacle.type}
                        onValueChange={(value: any) =>
                          updateObstacle(obstacle.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="cylinder">Cylinder</SelectItem>
                          <SelectItem value="sphere">Sphere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={obstacle.color}
                        onChange={(e) =>
                          updateObstacle(obstacle.id, { color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div>
                      <Label className="text-xs">Position X</Label>
                      <Input
                        type="number"
                        value={obstacle.position.x}
                        onChange={(e) =>
                          updateObstacle(obstacle.id, {
                            position: {
                              ...obstacle.position,
                              x: parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position Y</Label>
                      <Input
                        type="number"
                        value={obstacle.position.y}
                        onChange={(e) =>
                          updateObstacle(obstacle.id, {
                            position: {
                              ...obstacle.position,
                              y: parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position Z</Label>
                      <Input
                        type="number"
                        value={obstacle.position.z}
                        onChange={(e) =>
                          updateObstacle(obstacle.id, {
                            position: {
                              ...obstacle.position,
                              z: parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="h-4 w-4" />
          Create Map
        </Button>
      </div>
    </div>
  );
};

export default MapCreator;
