import React from "react";

const UserTable = ({
    users,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {

    return (

        <div className="card shadow">

            <div className="card-header bg-primary text-white">

                <h5 className="mb-0">
                    Danh sách tài khoản
                </h5>

            </div>

            <div className="card-body p-0">

                <table className="table table-hover table-bordered align-middle mb-0">

                    <thead className="table-dark">

                        <tr>

                            <th width="60">
                                STT
                            </th>

                            <th width="80">
                                Avatar
                            </th>

                            <th>
                                Họ tên
                            </th>

                            <th>
                                Email
                            </th>

                            <th width="120">
                                Vai trò
                            </th>

                            <th width="120">
                                Trạng thái
                            </th>

                            <th width="250">
                                Thao tác
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            users.length === 0 ?

                                (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center p-4"
                                        >

                                            Không có dữ liệu

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    users.map((user, index) => (

                                        <tr key={user._id}>

                                            <td>

                                                {index + 1}

                                            </td>

                                            <td className="text-center">

                                                <img

                                                    src={
                                                        user.avatar
                                                            ? user.avatar
                                                            : "https://ui-avatars.com/api/?name=" +
                                                            user.name
                                                    }

                                                    alt="avatar"

                                                    width="50"

                                                    height="50"

                                                    style={{
                                                        objectFit: "cover",
                                                        borderRadius: "50%"
                                                    }}

                                                />

                                            </td>

                                            <td>

                                                {user.name}

                                            </td>

                                            <td>

                                                {user.email}

                                            </td>

                                            <td>

                                                {
                                                    user.role === "admin" ? (
                                                        <span className="badge bg-danger">Admin</span>
                                                    ) : user.role === "staff" ? (
                                                        <span className="badge bg-info text-dark">Staff</span>
                                                    ) : (
                                                        <span className="badge bg-success">User</span>
                                                    )
                                                }

                                            </td>

                                            <td>

                                                {

                                                    user.status !== false

                                                        ?

                                                        <span className="badge bg-success">

                                                            Hoạt động

                                                        </span>

                                                        :

                                                        <span className="badge bg-secondary">

                                                            Đã khóa

                                                        </span>

                                                }

                                            </td>

                                            <td className="text-center">
                                                {user.role === "admin" ? (
                                                    <span className="badge bg-secondary text-wrap" style={{ opacity: 0.8, fontSize: '0.8rem' }}>
                                                        Tài khoản hệ thống
                                                    </span>
                                                ) : (
                                                    <button
                                                        className={
                                                            user.status !== false
                                                                ? "btn btn-dark btn-sm px-3"
                                                                : "btn btn-success btn-sm px-3"
                                                        }
                                                        onClick={() => onToggleStatus(user._id)}
                                                    >
                                                        {user.status !== false ? "Khóa" : "Mở khóa"}
                                                    </button>
                                                )}
                                            </td>

                                        </tr>

                                    ))

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

};

export default UserTable;
