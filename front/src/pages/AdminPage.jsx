import { useState, useEffect } from 'react';
import { Table, message, Select } from 'antd';
import AdminHeader from '../components/Header/AdminHeader';
import { getUsers, updateUserRole } from '../api/users';
import { trackInteraction, trackScreenView } from '../api/events';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data || []);
            trackScreenView('users_admin_view', { users_total: (data || []).length });
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке пользователей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            message.success('Роль пользователя успешно обновлена');
            trackInteraction('user_status_change', { target_user_id: userId, new_status: newRole });
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            message.error(error.message || 'Ошибка при обновлении роли пользователя');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            width: 200,
            render: (role, record) => (
                <Select
                    value={role}
                    style={{ width: '100%' }}
                    onChange={(newRole) => handleRoleChange(record.id, newRole)}
                >
                    <Select.Option value="User">User</Select.Option>
                    <Select.Option value="Admin">Admin</Select.Option>
                </Select>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <AdminHeader />
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '24px' }}>Пользователи</h2>
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
}

export default AdminPage;
