import axios from 'axios';
const instance = axios.create({
  baseURL: 'http://192.161.132.105:5000/api', // replace with your IP + backend port
});

export default instance;
