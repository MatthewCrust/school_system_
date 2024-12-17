import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    Authorization: localStorage.getItem('token'),
  },
});

export default instance;
