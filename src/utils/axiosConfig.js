import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://speedyapp.ng/api/v1/',
    // baseURL: 'http://speedy-api.test/api/v1/',

});

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }

);

export default axiosInstance;
