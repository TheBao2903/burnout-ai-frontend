// ==========================================
// Dashboard Switcher - Điều phối Role thông minh
// Admin -> AdminDashboard | User -> UserDashboard
// Tối ưu Code-splitting với React.lazy & Suspense
// ==========================================

import React, { Suspense } from "react";
import { Skeleton, Row, Col } from "antd";
import { useAuth } from "../contexts/AuthContext";

// Lazy load để User không phải tải mã nguồn của Admin Dashboard và ngược lại
const AdminDashboard = React.lazy(() => import("./AdminDashboard"));
const UserDashboard = React.lazy(() => import("./UserDashboard"));

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <Skeleton.Button active block style={{ height: 80, borderRadius: 16 }} />
      <Row gutter={16}>
        <Col span={8}><Skeleton.Button active block style={{ height: 120, borderRadius: 16 }} /></Col>
        <Col span={8}><Skeleton.Button active block style={{ height: 120, borderRadius: 16 }} /></Col>
        <Col span={8}><Skeleton.Button active block style={{ height: 120, borderRadius: 16 }} /></Col>
      </Row>
      <Skeleton.Button active block style={{ height: 280, borderRadius: 16 }} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </Suspense>
  );
}
