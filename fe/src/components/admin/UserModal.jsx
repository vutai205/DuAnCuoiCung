import React, { useEffect, useState } from "react";

const UserModal = ({
    show,
    onClose,
    onSubmit,
    editingUser,
}) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    useEffect(() => {

        if (editingUser) {

            setFormData({
                name: editingUser.name || "",
                email: editingUser.email || "",
                password: "",
                role: editingUser.role || "user",
            });

        } else {

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user",
            });

        }

    }, [editingUser]);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!formData.name.trim()) {
            return alert("Vui lòng nhập họ tên");
        }

        if (!formData.email.trim()) {
            return alert("Vui lòng nhập email");
        }

        if (
            !editingUser &&
            !formData.password.trim()
        ) {
            return alert("Vui lòng nhập mật khẩu");
        }

        onSubmit(formData);

    };

    if (!show) return null;

    return (

        <div
            className="modal d-block"
            style={{
                background: "rgba(0,0,0,.5)"
            }}
        >

            <div className="modal-dialog">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5>

                            {
                                editingUser
                                    ? "Cập nhật tài khoản"
                                    : "Thêm tài khoản"
                            }

                        </h5>

                        <button
                            className="btn-close"
                            onClick={onClose}
                        />

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">

                            <div className="mb-3">

                                <label className="form-label">

                                    Họ tên

                                </label>

                                <input
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">

                                    Email

                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                            </div>

                            {

                                !editingUser && (

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Mật khẩu

                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />

                                    </div>

                                )

                            }

                            <div className="mb-3">

                                <label className="form-label">

                                    Vai trò

                                </label>

                                <select
                                    className="form-select"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >

                                    <option value="user">
                                        User
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >

                                Hủy

                            </button>

                            <button
                                className="btn btn-primary"
                                type="submit"
                            >

                                {
                                    editingUser
                                        ? "Cập nhật"
                                        : "Thêm"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

};

export default UserModal;
