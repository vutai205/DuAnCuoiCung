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

                                                    user.role === "admin"

                                                        ?

                                                        <span className="badge bg-danger">

                                                            Admin

                                                        </span>

                                                        :

                                                        <span className="badge bg-success">

                                                            User

                                                        </span>

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

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <button

                                                        className="btn btn-warning btn-sm"

                                                        onClick={() => onEdit(user)}

                                                    >

                                                        Sửa

                                                    </button>

                                                    <button

                                                        className="btn btn-danger btn-sm"

                                                        onClick={() => {

                                                            if (

                                                                window.confirm(
                                                                    "Bạn có chắc muốn xóa tài khoản này?"
                                                                )
                                                            ) {

                                                                onDelete(user._id);

                                                            }

                                                        }}

                                                    >

                                                        Xóa

                                                    </button>

                                                    <button

                                                        className={
                                                            user.status !== false
                                                                ? "btn btn-secondary btn-sm"
                                                                : "btn btn-success btn-sm"
                                                        }

                                                        onClick={() =>
                                                            onToggleStatus(user._id)
                                                        }

                                                    >

                                                        {

                                                            user.status !== false

                                                                ?

                                                                "Khóa"

                                                                :

                                                                "Mở"

                                                        }

                                                    </button>

                                                </div>

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
