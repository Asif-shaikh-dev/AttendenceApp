import axios from 'axios';
const instance = axios.create({
  baseURL: 'http://192.161.132.105:5000/api'// Actual url use karna hai.. this is for development only
});

export default instance;
