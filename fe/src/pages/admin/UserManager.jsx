import React, { useEffect, useState } from "react";

import SearchUser from "../../components/admin/SearchUser";
import UserTable from "../../components/admin/UserTable";
import UserModal from "../../components/admin/UserModal";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    searchUser,
} from "../../services/userService";

const UserManager = () => {

    const [users, setUsers] = useState([]);

    const [keyword, setKeyword] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {

        loadUsers();

    }, []);

    const loadUsers = async () => {

        try {

            const data = await getUsers();

            setUsers(data);

        } catch (err) {

            console.log(err);

        }

    };

    const handleSearch = async () => {

        if (!keyword.trim()) {

            loadUsers();

            return;

        }

        try {

            const data = await searchUser(keyword);

            setUsers(data);

        } catch (err) {

            console.log(err);

        }

    };

    const handleAdd = () => {

        setEditingUser(null);

        setShowModal(true);

    };

    const handleEdit = (user) => {

        setEditingUser(user);

        setShowModal(true);

    };

    const handleSave = async (formData) => {

        try {

            if (editingUser) {

                await updateUser(editingUser._id, formData);

                alert("Cập nhật thành công");

            } else {

                await createUser(formData);

                alert("Thêm tài khoản thành công");

            }

            setShowModal(false);

            loadUsers();

        } catch (err) {

            console.log(err);

            alert("Có lỗi xảy ra");

        }

    };

    const handleDelete = async (id) => {

        try {

            await deleteUser(id);

            alert("Đã xóa");

            loadUsers();

        } catch (err) {

            console.log(err);

        }

    };

    const handleToggle = async (id) => {

        try {

            await toggleStatus(id);

            loadUsers();

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="container-fluid">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>

                    Quản lý tài khoản

                </h2>

                <button
                    className="btn btn-success"
                    onClick={handleAdd}
                >

                    + Thêm tài khoản

                </button>

            </div>

            <SearchUser

                keyword={keyword}

                setKeyword={setKeyword}

                onSearch={handleSearch}

                onReset={loadUsers}

            />

            <UserTable

                users={users}

                onEdit={handleEdit}

                onDelete={handleDelete}

                onToggleStatus={handleToggle}

            />

            <UserModal

                show={showModal}

                editingUser={editingUser}

                onClose={() => setShowModal(false)}

                onSubmit={handleSave}

            />

        </div>

    );

};

export default UserManager;
