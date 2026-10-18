// ==========================================
// Users Page - Admin User Management (ProTable Style)
// ==========================================

import { useState, useEffect } from "react";
import {
  TeamOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  SettingOutlined,
  SwapOutlined,
  EllipsisOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  message,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
} from "antd";
import { useNavigate } from "react-router-dom";
import userService from "../services/user";
import type { User } from "../services/user";
import { useAuth } from "../contexts/AuthContext";

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

const waitTime = async (time: number = 100) => {
  await new Promise((resolve) => setTimeout(resolve, time));
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    offset: 0,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | "">("");
  const [columnsSettingOpen, setColumnsSettingOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    "email",
    "phone",
    "role",
    "status",
    "lastLogin",
  ]);

  const [messageApi, contextHolder] = message.useMessage();

  // Load saved columns
  useEffect(() => {
    const saved = localStorage.getItem("users-columns");
    if (saved) {
      try {
        setSelectedColumns(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save columns
  const saveColumns = (cols: string[]) => {
    setSelectedColumns(cols);
    localStorage.setItem("users-columns", JSON.stringify(cols));
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      await waitTime(500);
      const data = await userService.getUsers({
        limit: pagination.limit,
        offset: pagination.offset,
      });
      setUsers(data.users);
      setPagination({
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      });
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (
    paginationConf: any,
    filters: any,
    sorter: any
  ) => {
    // Pagination
    const newOffset = (paginationConf.current - 1) * paginationConf.pageSize;
    if (newOffset !== pagination.offset) {
      setPagination((p) => ({
        ...p,
        offset: newOffset,
        limit: paginationConf.pageSize,
      }));
      fetchUsers();
    }

    // Sorting
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField("");
      setSortOrder("");
    }
  };

  // Filter & sort users locally
  const filteredUsers = users
    .filter((user) => {
      if (searchValue) {
        const search = searchValue.toLowerCase();
        if (
          !user.username.toLowerCase().includes(search) &&
          !user.email?.toLowerCase().includes(search) &&
          !user.full_name?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (roleFilter && user.role !== roleFilter) return false;
      if (statusFilter && String(user.is_active) !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = (a as any)[sortField] || "";
      let bVal = (b as any)[sortField] || "";
      if (sortOrder === "ascend") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

  // Add user
  const handleAdd = async (values: any) => {
    setSaving(true);
    try {
      await userService.createUser(values);
      messageApi.success("Thêm user thành công!");
      setShowAddModal(false);
      addForm.resetFields();
      fetchUsers();
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || "Thêm user thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Edit user
  const handleEdit = async (values: any) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await userService.updateUser(editingUser.id, values);
      messageApi.success("Cập nhật thành công!");
      setEditingUser(null);
      editForm.resetFields();
      fetchUsers();
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active
  const toggleActive = async (user: User) => {
    try {
      await userService.toggleUserActive(user.id, !user.is_active);
      messageApi.success(
        `Đã ${!user.is_active ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công!`
      );
      fetchUsers();
    } catch {
      messageApi.error("Cập nhật trạng thái thất bại");
    }
  };

  // Vô hiệu hóa user (Soft delete - bảo lưu toàn bộ dữ liệu)
  const handleDelete = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      messageApi.success("Đã vô hiệu hóa tài khoản (Dữ liệu lịch sử vẫn được bảo lưu an toàn)!");
      fetchUsers();
    } catch {
      messageApi.error("Vô hiệu hóa tài khoản thất bại");
    }
  };

  // Export
  const handleExport = () => {
    const csvContent = [
      [
        "Username",
        "Full Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Created",
        "Last Login",
      ].join(","),
      ...filteredUsers.map((u) =>
        [
          u.username,
          u.full_name || "",
          u.email || "",
          u.phone || "",
          u.role,
          u.is_active ? "Active" : "Inactive",
          u.created_at || "",
          u.last_login_at || "",
        ]
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["﻿" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Import placeholder
  const handleImport = () => {
    Modal.info({ title: "Thông báo", content: "Tính năng đang phát triển!" });
  };

  // Reset columns
  const resetColumns = () => {
    saveColumns(["email", "phone", "role", "status", "lastLogin"]);
  };

  const columnsConfig = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Điện thoại" },
    { key: "role", label: "Vai trò" },
    { key: "status", label: "Trạng thái" },
    { key: "lastLogin", label: "Đăng nhập cuối" },
  ];

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TeamOutlined className="text-2xl text-blue-500" />
          <span className="text-xl font-semibold">Quản lý Users</span>
        </div>

        {/* Toolbar */}
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddModal(true)}
          >
            Thêm mới
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: "import",
                  icon: <UploadOutlined />,
                  label: "Nhập dữ liệu",
                  onClick: handleImport,
                },
                {
                  key: "export",
                  icon: <DownloadOutlined />,
                  label: "Xuất dữ liệu",
                  onClick: handleExport,
                },
              ],
            }}
          >
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>

          <Button
            icon={<SettingOutlined />}
            onClick={() => setColumnsSettingOpen(true)}
          />
        </Space>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toolbar Search */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 flex-wrap">
          <Input.Search
            placeholder="Tìm kiếm username, email, tên..."
            className="w-64"
            allowClear
            onSearch={setSearchValue}
            onChange={(e) => !e.target.value && setSearchValue("")}
          />

          <Select
            placeholder="Vai trò"
            className="w-32"
            allowClear
            value={roleFilter || undefined}
            onChange={setRoleFilter}
            options={[
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
          />

          <Select
            placeholder="Trạng thái"
            className="w-32"
            allowClear
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />

          <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchUsers}>
            Làm mới
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                  #
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === "username") {
                      setSortOrder(
                        sortOrder === "ascend" ? "descend" : "ascend"
                      );
                    } else {
                      setSortField("username");
                      setSortOrder("ascend");
                    }
                  }}
                >
                  <Space size={4}>
                    User
                    {sortField === "username" ? (
                      sortOrder === "ascend" ? (
                        <ArrowUpOutlined className="text-blue-500" />
                      ) : (
                        <ArrowDownOutlined className="text-blue-500" />
                      )
                    ) : (
                      <SwapOutlined className="text-gray-400" />
                    )}
                  </Space>
                </th>
                {selectedColumns.includes("email") && (
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === "email") {
                        setSortOrder(
                          sortOrder === "ascend" ? "descend" : "ascend"
                        );
                      } else {
                        setSortField("email");
                        setSortOrder("ascend");
                      }
                    }}
                  >
                    <Space size={4}>
                      Liên hệ
                      {sortField === "email" ? (
                        sortOrder === "ascend" ? (
                          <ArrowUpOutlined className="text-blue-500" />
                        ) : (
                          <ArrowDownOutlined className="text-blue-500" />
                        )
                      ) : (
                        <SwapOutlined className="text-gray-400" />
                      )}
                    </Space>
                  </th>
                )}
                {selectedColumns.includes("phone") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Điện thoại
                  </th>
                )}
                {selectedColumns.includes("role") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <Space size={4}>Vai trò</Space>
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                )}
                {selectedColumns.includes("lastLogin") && (
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortField === "last_login_at") {
                        setSortOrder(
                          sortOrder === "ascend" ? "descend" : "ascend"
                        );
                      } else {
                        setSortField("last_login_at");
                        setSortOrder("ascend");
                      }
                    }}
                  >
                    <Space size={4}>
                      Đăng nhập cuối
                      {sortField === "last_login_at" ? (
                        sortOrder === "ascend" ? (
                          <ArrowUpOutlined className="text-blue-500" />
                        ) : (
                          <ArrowDownOutlined className="text-blue-500" />
                        )
                      ) : (
                        <SwapOutlined className="text-gray-400" />
                      )}
                    </Space>
                  </th>
                )}
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === "created_at") {
                      setSortOrder(
                        sortOrder === "ascend" ? "descend" : "ascend"
                      );
                    } else {
                      setSortField("created_at");
                      setSortOrder("ascend");
                    }
                  }}
                >
                  <Space size={4}>
                    Ngày tạo
                    {sortField === "created_at" ? (
                      sortOrder === "ascend" ? (
                        <ArrowUpOutlined className="text-blue-500" />
                      ) : (
                        <ArrowDownOutlined className="text-blue-500" />
                      )
                    ) : (
                      <SwapOutlined className="text-gray-400" />
                    )}
                  </Space>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <LoadingOutlined
                      className="animate-spin mx-auto text-gray-400"
                      style={{ fontSize: 24 }}
                    />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Không có user nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pagination.offset + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Space>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.username}
                          </div>
                          {user.full_name && (
                            <div className="text-xs text-gray-500">
                              {user.full_name}
                            </div>
                          )}
                        </div>
                      </Space>
                    </td>
                    {selectedColumns.includes("email") && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email || "-"}
                      </td>
                    )}
                    {selectedColumns.includes("phone") && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.phone || "-"}
                      </td>
                    )}
                    {selectedColumns.includes("role") && (
                      <td className="px-4 py-3">
                        <Tag
                          color={user.role === "admin" ? "purple" : "default"}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </Tag>
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="px-4 py-3">
                        <Tag
                          color={user.is_active ? "success" : "error"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(user)}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Tag>
                      </td>
                    )}
                    {selectedColumns.includes("lastLogin") && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleString("vi-VN")
                          : "-"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Space>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          title="Xem chi tiết"
                          onClick={() => navigate(`/users/${user.id}`)}
                        />
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingUser(user);
                            editForm.setFieldsValue({
                              full_name: user.full_name,
                              email: user.email,
                              phone: user.phone,
                              role: user.role,
                              is_active: user.is_active,
                            });
                          }}
                        />
                        {user.id !== currentUser?.uid &&
                          user.id !== currentUser?.id && (
                            <Popconfirm
                              title={
                                user.is_active
                                  ? "Vô hiệu hóa user này?"
                                  : "Kích hoạt lại user này?"
                              }
                              description={
                                user.is_active
                                  ? "Tài khoản sẽ bị khóa quyền truy cập. Toàn bộ dữ liệu lịch sử khảo sát & cảm xúc vẫn được bảo lưu an toàn."
                                  : "Tài khoản sẽ được mở khóa và người dùng có thể đăng nhập trở lại."
                              }
                              onConfirm={() => toggleActive(user)}
                              okText={user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                              cancelText="Hủy"
                            >
                              <Button
                                type="link"
                                size="small"
                                danger={user.is_active}
                                icon={
                                  user.is_active ? (
                                    <DeleteOutlined />
                                  ) : (
                                    <CheckCircleOutlined className="text-green-600" />
                                  )
                                }
                                title={
                                  user.is_active
                                    ? "Vô hiệu hóa tài khoản (Không xóa dữ liệu)"
                                    : "Kích hoạt lại tài khoản"
                                }
                              />
                            </Popconfirm>
                          )}
                      </Space>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {pagination.offset + 1} -{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            trong {pagination.total} users
          </div>
          <Space>
            <Button
              size="small"
              disabled={pagination.offset === 0}
              onClick={() => {
                setPagination((p) => ({
                  ...p,
                  offset: Math.max(0, p.offset - p.limit),
                }));
                fetchUsers();
              }}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {Math.floor(pagination.offset / pagination.limit) + 1} /{" "}
              {Math.ceil(pagination.total / pagination.limit) || 1}
            </span>
            <Button
              size="small"
              disabled={
                pagination.offset + pagination.limit >= pagination.total
              }
              onClick={() => {
                setPagination((p) => ({ ...p, offset: p.offset + p.limit }));
                fetchUsers();
              }}
            >
              Sau
            </Button>
          </Space>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        title="Thêm User mới"
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          addForm.resetFields();
        }}
        footer={null}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Vui lòng nhập password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="full_name" label="Họ tên">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="user">
            <Select
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Thêm
              </Button>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  addForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Sửa User: ${editingUser?.username}`}
        open={!!editingUser}
        onCancel={() => {
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="full_name" label="Họ tên">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò">
            <Select
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <CheckCircleOutlined />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Lưu
              </Button>
              <Button
                onClick={() => {
                  setEditingUser(null);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Columns Settings */}
      <Modal
        title="Cài đặt cột"
        open={columnsSettingOpen}
        onCancel={() => setColumnsSettingOpen(false)}
        footer={[
          <Button key="reset" onClick={resetColumns}>
            Mặc định
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setColumnsSettingOpen(false)}
          >
            Đóng
          </Button>,
        ]}
      >
        <div className="space-y-2">
          {columnsConfig.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    saveColumns([...selectedColumns, col.key]);
                  } else {
                    saveColumns(selectedColumns.filter((k) => k !== col.key));
                  }
                }}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
