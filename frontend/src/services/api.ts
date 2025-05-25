import api from '../config/api';

// Auth Services
export const authService = {
    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
};

// Patient Services
export const patientService = {
    getAll: () => api.get('/patients'),
    getById: (id: number) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: number, data: any) => api.put(`/patients/${id}`, data),
    delete: (id: number) => api.delete(`/patients/${id}`),
};

// Study Services
export const studyService = {
    getAll: () => api.get('/studies'),
    getById: (id: number) => api.get(`/studies/${id}`),
    create: (data: any) => api.post('/studies', data),
    update: (id: number, data: any) => api.put(`/studies/${id}`, data),
    delete: (id: number) => api.delete(`/studies/${id}`),
};

// Report Services
export const reportService = {
    getAll: () => api.get('/reports'),
    getById: (id: number) => api.get(`/reports/${id}`),
    create: (data: any) => api.post('/reports', data),
    update: (id: number, data: any) => api.put(`/reports/${id}`, data),
    delete: (id: number) => api.delete(`/reports/${id}`),
};

// Equipment Services
export const equipmentService = {
    getAll: () => api.get('/equipment'),
    getById: (id: number) => api.get(`/equipment/${id}`),
    create: (data: any) => api.post('/equipment', data),
    update: (id: number, data: any) => api.put(`/equipment/${id}`, data),
    delete: (id: number) => api.delete(`/equipment/${id}`),
};

// Quality Control Services
export const qualityControlService = {
    getAll: () => api.get('/quality-control'),
    getById: (id: number) => api.get(`/quality-control/${id}`),
    create: (data: any) => api.post('/quality-control', data),
    update: (id: number, data: any) => api.put(`/quality-control/${id}`, data),
    delete: (id: number) => api.delete(`/quality-control/${id}`),
};

// Document Services
export const documentService = {
    getAll: () => api.get('/documents'),
    getById: (id: number) => api.get(`/documents/${id}`),
    create: (formData: FormData) => api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id: number, data: any) => api.put(`/documents/${id}`, data),
    delete: (id: number) => api.delete(`/documents/${id}`),
    getVersions: (id: number) => api.get(`/documents/${id}/versions`),
    share: (data: any) => api.post('/documents/share', data),
};

// Inventory Services
export const inventoryService = {
    getAll: () => api.get('/inventory/supplies'),
    getById: (id: number) => api.get(`/inventory/supplies/${id}`),
    create: (data: any) => api.post('/inventory/supplies', data),
    update: (id: number, data: any) => api.put(`/inventory/supplies/${id}`, data),
    delete: (id: number) => api.delete(`/inventory/supplies/${id}`),
    getTransactions: () => api.get('/inventory/transactions'),
    getAlerts: () => api.get('/inventory/alerts'),
};

// Audit Services
export const auditService = {
    getLogs: () => api.get('/audit/logs'),
    getCompliance: () => api.get('/audit/compliance'),
    getIncidents: () => api.get('/audit/incidents'),
    createIncident: (data: any) => api.post('/audit/incidents', data),
    updateIncident: (id: number, data: any) => api.put(`/audit/incidents/${id}`, data),
}; 