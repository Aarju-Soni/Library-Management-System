import axios from "axios";

const api = axios.create({
    baseURL: "https://library-management-system-cgdj.onrender.com",
});

export default api;