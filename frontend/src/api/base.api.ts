import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth headers, logging, etc.
    this.client.interceptors.request.use(
      config => {
        // Add auth headers here if needed
        // config.headers.Authorization = `Bearer ${token}`;

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        // Handle common errors here
        if (error.response?.status === 401) {
          // Handle unauthorized
          console.error('Unauthorized access');
        } else if (error.response?.status >= 500) {
          // Handle server errors
          console.error('Server error:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
          // Handle timeout
          console.error('Request timeout');
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
