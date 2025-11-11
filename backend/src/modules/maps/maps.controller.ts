import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import mapService from './maps.service.js';

export class MapController {
  async createMap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { name, description, terrain, obstacles, startPosition, isPublic, thumbnail } = req.body;

      const map = await mapService.createMap(
        req.user.id,
        name,
        description,
        terrain,
        obstacles,
        startPosition,
        isPublic,
        thumbnail
      );

      res.status(201).json({
        success: true,
        message: 'Map created successfully',
        data: map,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await mapService.getMaps(page, limit);

      res.status(200).json({
        success: true,
        data: result.maps,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMapById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const map = await mapService.getMapById(id);

      res.status(200).json({
        success: true,
        data: map,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const map = await mapService.updateMap(id, req.user.id, updates);

      res.status(200).json({
        success: true,
        message: 'Map updated successfully',
        data: map,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;

      const result = await mapService.deleteMap(id, req.user.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminMaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await mapService.getAdminMaps(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result.maps,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MapController();
