import { body, param, query, ValidationChain } from 'express-validator';

// Auth Validators
export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Project Validators
export const createProjectValidator: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('blocklyWorkspace')
    .optional()
    .isString()
    .withMessage('Blockly workspace must be a string'),
  body('robot3DConfig')
    .optional()
    .isObject()
    .withMessage('Robot 3D config must be an object'),
];

export const updateProjectValidator: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('blocklyWorkspace')
    .optional()
    .isString()
    .withMessage('Blockly workspace must be a string'),
  body('robot3DConfig')
    .optional()
    .isObject()
    .withMessage('Robot 3D config must be an object'),
];

// Map Validators
export const createMapValidator: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Map name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('terrain')
    .isObject()
    .withMessage('Terrain configuration is required'),
  body('obstacles')
    .optional()
    .isArray()
    .withMessage('Obstacles must be an array'),
  body('startPosition')
    .isObject()
    .withMessage('Start position is required'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

// Pagination Validators
export const paginationValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// ID Validator
export const idValidator: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
