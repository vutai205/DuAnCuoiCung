import React from "react";

const SearchUser = ({
    keyword,
    setKeyword,
    onSearch,
    onReset,
}) => {
    return (
        <div className="card shadow-sm mb-3">
            <div className="card-body">

                <div className="row">

                    <div className="col-md-8">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập tên hoặc email..."
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onSearch();
                                }
                            }}
                        />

                    </div>

                    <div className="col-md-4 d-flex gap-2">

                        <button
                            className="btn btn-primary w-100"
                            onClick={onSearch}
                        >
                            <i className="bi bi-search"></i> Tìm kiếm
                        </button>

                        <button
                            className="btn btn-secondary w-100"
                            onClick={onReset}
                        >
                            Làm mới
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default SearchUser;
