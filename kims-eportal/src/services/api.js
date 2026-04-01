import axios from "axios";

const API = axios.create({
  baseURL: "http://10.11.173.89:5000/api",
});

export default API;
