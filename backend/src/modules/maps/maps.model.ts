import mongoose, { Schema, Model } from 'mongoose';
import { IMap } from '../../types/index.js';

const mapSchema = new Schema<IMap>(
  {
    name: {
      type: String,
      required: [true, 'Map name is required'],
      trim: true,
      maxlength: [100, 'Map name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: '',
    },
    terrain: {
      type: Schema.Types.Mixed,
      required: [true, 'Terrain configuration is required'],
      default: {
        width: 100,
        height: 1,
        depth: 100,
        texture: 'grass',
      },
    },
    obstacles: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    startPosition: {
      type: Schema.Types.Mixed,
      required: [true, 'Start position is required'],
      default: { x: 0, y: 0, z: 0 },
    },
    createdBy: {
      type: String,
      required: [true, 'Creator ID is required'],
      ref: 'User',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
mapSchema.index({ isPublic: 1, createdAt: -1 });
mapSchema.index({ createdBy: 1 });

const Map: Model<IMap> = mongoose.model<IMap>('Map', mapSchema);

export default Map;
