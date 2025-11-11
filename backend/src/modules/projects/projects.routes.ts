import { Router } from 'express';
import projectController from './projects.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import {
  createProjectValidator,
  updateProjectValidator,
  paginationValidator,
  idValidator,
} from '../../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
router.get('/', paginationValidator, validate, projectController.getProjects);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', createProjectValidator, validate, projectController.createProject);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', idValidator, validate, projectController.getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', updateProjectValidator, validate, projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', idValidator, validate, projectController.deleteProject);

export default router;
