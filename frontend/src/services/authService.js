import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refresh_token: refreshToken,
                });

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Clear local storage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Generic GET request
api.get = (url, config = {}) => {
    return api.request({ ...config, method: 'GET', url });
};

// Generic POST request
api.post = (url, data = {}, config = {}) => {
    return api.request({ ...config, method: 'POST', url, data });
};

// Generic PUT request
api.put = (url, data = {}, config = {}) => {
    return api.request({ ...config, method: 'PUT', url, data });
};

// Generic PATCH request
api.patch = (url, data = {}, config = {}) => {
    return api.request({ ...config, method: 'PATCH', url, data });
};

// Generic DELETE request
api.delete = (url, config = {}) => {
    return api.request({ ...config, method: 'DELETE', url });
};

// Upload file with progress
api.upload = (url, file, onProgress, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, file);

    return api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

// Download file
api.download = (url, filename, config = {}) => {
    return api.get(url, {
        ...config,
        responseType: 'blob',
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    });
};

export default api;