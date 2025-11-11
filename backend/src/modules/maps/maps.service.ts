import Map from './maps.model.js';
import User from '../users/users.model.js';
import { AppError, TerrainConfig, ObstacleConfig, Vector3 } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class MapService {
  async createMap(
    userId: string,
    name: string,
    description: string,
    terrain: TerrainConfig,
    obstacles: ObstacleConfig[],
    startPosition: Vector3,
    isPublic: boolean = true,
    thumbnail?: string
  ) {
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new AppError('Only admins can create maps', 403);
    }

    const map = await Map.create({
      name,
      description,
      terrain,
      obstacles,
      startPosition,
      createdBy: userId,
      isPublic,
      thumbnail,
    });

    logger.info(`Map created: ${map._id} by admin ${userId}`);

    return map;
  }

  async getMaps(page: number = 1, limit: number = 10, isPublic: boolean = true) {
    const skip = (page - 1) * limit;

    const query = isPublic ? { isPublic: true } : {};

    const [maps, total] = await Promise.all([
      Map.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Map.countDocuments(query),
    ]);

    return {
      maps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMapById(mapId: string) {
    const map = await Map.findById(mapId);

    if (!map) {
      throw new AppError('Map not found', 404);
    }

    if (!map.isPublic) {
      throw new AppError('This map is not publicly available', 403);
    }

    return map;
  }

  async updateMap(
    mapId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string;
      terrain?: TerrainConfig;
      obstacles?: ObstacleConfig[];
      startPosition?: Vector3;
      isPublic?: boolean;
      thumbnail?: string;
    }
  ) {
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new AppError('Only admins can update maps', 403);
    }

    const map = await Map.findById(mapId);

    if (!map) {
      throw new AppError('Map not found', 404);
    }

    Object.assign(map, updates);
    await map.save();

    logger.info(`Map updated: ${mapId} by admin ${userId}`);

    return map;
  }

  async deleteMap(mapId: string, userId: string) {
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new AppError('Only admins can delete maps', 403);
    }

    const map = await Map.findById(mapId);

    if (!map) {
      throw new AppError('Map not found', 404);
    }

    await Map.findByIdAndDelete(mapId);

    logger.info(`Map deleted: ${mapId} by admin ${userId}`);

    return { message: 'Map deleted successfully' };
  }

  async getAdminMaps(userId: string, page: number = 1, limit: number = 10) {
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new AppError('Only admins can access this endpoint', 403);
    }

    const skip = (page - 1) * limit;

    const [maps, total] = await Promise.all([
      Map.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Map.countDocuments(),
    ]);

    return {
      maps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new MapService();
