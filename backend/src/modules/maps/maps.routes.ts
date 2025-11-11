import { Router } from 'express';
import mapController from './maps.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import {
  createMapValidator,
  paginationValidator,
  idValidator,
} from '../../utils/validators.js';

const router = Router();

/**
 * @route   GET /api/maps
 * @desc    Get all public maps
 * @access  Public
 */
router.get('/', paginationValidator, validate, mapController.getMaps);

/**
 * @route   GET /api/maps/:id
 * @desc    Get map by ID
 * @access  Public
 */
router.get('/:id', idValidator, validate, mapController.getMapById);

/**
 * @route   POST /api/maps
 * @desc    Create a new map (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createMapValidator,
  validate,
  mapController.createMap
);

/**
 * @route   PUT /api/maps/:id
 * @desc    Update map (Admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  idValidator,
  validate,
  mapController.updateMap
);

/**
 * @route   DELETE /api/maps/:id
 * @desc    Delete map (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  idValidator,
  validate,
  mapController.deleteMap
);

/**
 * @route   GET /api/maps/admin/all
 * @desc    Get all maps including private (Admin only)
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  paginationValidator,
  validate,
  mapController.getAdminMaps
);

export default router;
