import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo?.token;
};

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
});

// Lấy danh sách user
export const getUsers = async () => {
    const res = await axios.get(API_URL, config());
    return res.data;
};

// Lấy thông tin 1 user
export const getUserById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, config());
    return res.data;
};

// Thêm user
export const createUser = async (data) => {
    const res = await axios.post(API_URL, data, config());
    return res.data;
};

// Cập nhật user
export const updateUser = async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data, config());
    return res.data;
};

// Xóa user
export const deleteUser = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, config());
    return res.data;
};

// Tìm kiếm
export const searchUser = async (keyword) => {
    const res = await axios.get(
        `${API_URL}/search?keyword=${keyword}`,
        config()
    );

    return res.data;
};

// Khóa/Mở khóa
export const toggleStatus = async (id) => {
    const res = await axios.put(
        `${API_URL}/status/${id}`,
        {},
        config()
    );

    return res.data;
};
