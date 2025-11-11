import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import projectService from './projects.service.js';

export class ProjectController {
  async createProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { name, description, blocklyWorkspace, robot3DConfig, mapId } = req.body;

      const project = await projectService.createProject(
        req.user.id,
        name,
        description,
        blocklyWorkspace,
        robot3DConfig,
        mapId
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await projectService.getProjects(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;

      const project = await projectService.getProjectById(id, req.user.id);

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const project = await projectService.updateProject(id, req.user.id, updates);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;

      const result = await projectService.deleteProject(id, req.user.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
