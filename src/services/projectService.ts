import api from './api';
import { Project, CreateProjectData, ApiResponse, PaginatedResponse } from '../types';

export const projectService = {
  async getProjects(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    const response = await api.get<PaginatedResponse<Project>>('/projects', {
      params: { page, limit },
    });
    return response.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data!;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },

  async updateProject(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
