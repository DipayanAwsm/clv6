import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 503) {
      error.message = 'Model service is not ready. Run the training pipeline and retry.';
    }
    return Promise.reject(error);
  }
);

export const getHealth = async () => (await api.get('/health')).data;
export const getMetadata = async () => (await api.get('/metadata')).data;
export const getModelMetrics = async () => (await api.get('/model-metrics')).data;
export const getEdaSummary = async () => (await api.get('/eda-summary')).data;
export const getFeatureSelectionSummary = async () =>
  (await api.get('/feature-selection-summary')).data;

export const predictSingle = async (payload) => (await api.post('/predict', payload)).data;
export const predictBatch = async (payload) =>
  (await api.post('/predict-batch', { records: payload })).data;

export const uploadCsvAndPredict = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload-csv-and-predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export default api;
