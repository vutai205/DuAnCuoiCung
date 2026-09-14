import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./Header";

const { Sider, Header, Content } = Layout;

export default function AdminLayout() {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={250}>
                <Sidebar />
            </Sider>

            <Layout>
                <Header style={{ padding: 0 }}>
                    <AdminHeader />
                </Header>

                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}