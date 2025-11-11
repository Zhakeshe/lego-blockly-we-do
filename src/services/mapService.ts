import api from './api';
import { Map, ApiResponse, PaginatedResponse, TerrainConfig, ObstacleConfig, Vector3 } from '../types';

export const mapService = {
  async getMaps(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Map>> {
    const response = await api.get<PaginatedResponse<Map>>('/maps', {
      params: { page, limit },
    });
    return response.data;
  },

  async getMapById(id: string): Promise<Map> {
    const response = await api.get<ApiResponse<Map>>(`/maps/${id}`);
    return response.data.data!;
  },

  async createMap(data: {
    name: string;
    description: string;
    terrain: TerrainConfig;
    obstacles: ObstacleConfig[];
    startPosition: Vector3;
    isPublic?: boolean;
    thumbnail?: string;
  }): Promise<Map> {
    const response = await api.post<ApiResponse<Map>>('/maps', data);
    return response.data.data!;
  },

  async updateMap(id: string, data: Partial<{
    name: string;
    description: string;
    terrain: TerrainConfig;
    obstacles: ObstacleConfig[];
    startPosition: Vector3;
    isPublic: boolean;
    thumbnail: string;
  }>): Promise<Map> {
    const response = await api.put<ApiResponse<Map>>(`/maps/${id}`, data);
    return response.data.data!;
  },

  async deleteMap(id: string): Promise<void> {
    await api.delete(`/maps/${id}`);
  },

  async getAdminMaps(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Map>> {
    const response = await api.get<PaginatedResponse<Map>>('/maps/admin/all', {
      params: { page, limit },
    });
    return response.data;
  },
};
