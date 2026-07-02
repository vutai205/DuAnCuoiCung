import Card from "../../components/admin/Card";

const Dashboard = () => {
    return (
        <>

            <div className="dashboard">

                <Card
                    title="Movies"
                    total={30}
                    color="#2563eb"
                />

                <Card
                    title="Users"
                    total={220}
                    color="#16a34a"
                />

                <Card
                    title="Bookings"
                    total={106}
                    color="#dc2626"
                />

                <Card
                    title="Revenue"
                    total={800}
                    color="#ca8a04"
                />

            </div>

            <div className="dashboard-table">

                <div className="box">

                    <h2>Recent Booking</h2>

                    <table>

                        <thead>

                            <tr>

                                <th>User</th>

                                <th>Movie</th>

                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Nguyen Van A</td>

                                <td>Avengers</td>

                                <td>
                                    <span className="success">
                                        Success
                                    </span>
                                </td>

                            </tr>

                            <tr>

                                <td>Tran Van B</td>

                                <td>Batman</td>

                                <td>

                                    <span className="pending">
                                        Pending
                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </>
    );
};

export default Dashboard;
