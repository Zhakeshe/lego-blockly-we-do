import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '../../types/index.js';

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: '',
    },
    blocklyWorkspace: {
      type: String,
      default: '',
    },
    robot3DConfig: {
      type: Schema.Types.Mixed,
      default: {
        chassis: {
          type: 'default',
          color: '#0066cc',
        },
        motors: [],
        sensors: [],
        wheels: [],
      },
    },
    mapId: {
      type: String,
      ref: 'Map',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;
