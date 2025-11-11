import Project from './projects.model.js';
import User from '../users/users.model.js';
import { AppError, Robot3DConfig } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class ProjectService {
  async createProject(
    userId: string,
    name: string,
    description?: string,
    blocklyWorkspace?: string,
    robot3DConfig?: Robot3DConfig,
    mapId?: string
  ) {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check subscription limits for free users
    if (user.subscriptionStatus === 'free') {
      const projectCount = await Project.countDocuments({ userId });
      if (projectCount >= 5) {
        throw new AppError('Free users can only create up to 5 projects. Please upgrade to premium.', 403);
      }
    }

    const project = await Project.create({
      userId,
      name,
      description,
      blocklyWorkspace,
      robot3DConfig,
      mapId,
    });

    logger.info(`Project created: ${project._id} by user ${userId}`);

    return project;
  }

  async getProjects(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments({ userId }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user owns the project
    if (project.userId !== userId) {
      throw new AppError('You do not have permission to access this project', 403);
    }

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string;
      blocklyWorkspace?: string;
      robot3DConfig?: Robot3DConfig;
      mapId?: string;
    }
  ) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user owns the project
    if (project.userId !== userId) {
      throw new AppError('You do not have permission to update this project', 403);
    }

    Object.assign(project, updates);
    await project.save();

    logger.info(`Project updated: ${projectId} by user ${userId}`);

    return project;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user owns the project
    if (project.userId !== userId) {
      throw new AppError('You do not have permission to delete this project', 403);
    }

    await Project.findByIdAndDelete(projectId);

    logger.info(`Project deleted: ${projectId} by user ${userId}`);

    return { message: 'Project deleted successfully' };
  }
}

export default new ProjectService();
