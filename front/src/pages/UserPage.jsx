import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import UserHeader from '../components/Header/UserHeader';
import ExpenseForm from '../components/ExpenseForm';
import IncomeForm from '../components/IncomeForm';
import { useAuth } from '../context/AuthContext';
import { 
    getExpenses, createExpense, updateExpense, deleteExpense,
    getIncome, createIncome, updateIncome, deleteIncome 
} from '../api/expenses';
import { getExpenseTypeFilters } from '../constants/expenseTypes';
import { trackConversion, trackInteraction, trackScreenView, trackSystemEvent } from '../api/events';

const { RangePicker } = DatePicker;

function UserPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expenseFormVisible, setExpenseFormVisible] = useState(false);
    const [incomeFormVisible, setIncomeFormVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editingIncome, setEditingIncome] = useState(null);

    const trackFilterSearchExec = (records, from, to, filterField) => {
        const startedAt = performance.now();
        const fromDate = dayjs(from);
        const toDate = dayjs(to);
        const resultsCount = records.filter((item) => {
            const itemDate = dayjs(item.date);
            return itemDate.isSameOrAfter(fromDate, 'day') && itemDate.isSameOrBefore(toDate, 'day');
        }).length;

        trackSystemEvent('filter_search_exec', {
            user_id: user?.id,
            query_string: `${filterField}:${fromDate.format('YYYY-MM-DD')}..${toDate.format('YYYY-MM-DD')}`,
            results_count: resultsCount,
            execution_time_ms: Math.round(performance.now() - startedAt),
            module_name: 'UserPage',
        });
    };

    const loadExpenses = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await getExpenses(user.id);
            setExpenses(data || []);
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке расходов');
        } finally {
            setLoading(false);
        }
    };

    const loadIncome = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await getIncome(user.id);
            setIncome(data || []);
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке доходов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            loadExpenses();
            loadIncome();
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        trackScreenView('finance_records_view', {
            user_id: user.id,
            record_count: expenses.length + income.length,
            filter_active: false,
        });
    }, [user?.id, expenses.length, income.length]);

    const handleExpenseSubmit = async (values) => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }
        try {
            const startedAt = performance.now();
            if (editingExpense) {
                const saved = await updateExpense(editingExpense.id, values, user.id);
                message.success('Расход успешно обновлен');
                trackInteraction('record_action_click', { user_id: user.id, action_type: 'update', entity_id: String(editingExpense.id) });
                trackConversion('record_saved', { user_id: user.id, record_id: saved.id, amount_value: Number(saved.amount || values.amount || 0) });
                trackSystemEvent('tax_auto_recalc', {
                    user_id: user.id,
                    calc_duration_ms: Math.round(performance.now() - startedAt),
                    trigger_event: 'operation_update',
                    module_name: 'UserPage',
                });
            } else {
                const saved = await createExpense(values, user.id);
                message.success('Расход успешно добавлен');
                trackInteraction('record_action_click', { user_id: user.id, action_type: 'create', entity_id: String(saved.id) });
                trackConversion('record_saved', { user_id: user.id, record_id: saved.id, amount_value: Number(saved.amount || values.amount || 0) });
                trackSystemEvent('tax_auto_recalc', {
                    user_id: user.id,
                    calc_duration_ms: Math.round(performance.now() - startedAt),
                    trigger_event: 'operation_create',
                    module_name: 'UserPage',
                });
            }
            trackSystemEvent('data_sync_check', { user_id: user.id, sync_status: 'success', records_affected: 1, module_name: 'UserPage' });
            setExpenseFormVisible(false);
            setEditingExpense(null);
            loadExpenses();
        } catch (error) {
            message.error(error.message || 'Ошибка при сохранении расхода');
            trackSystemEvent('error_log_trigger', {
                user_id: user?.id,
                error_code: 'EXPENSE_SAVE_ERROR',
                module_name: 'UserPage',
                severity: 'warning',
            });
            trackSystemEvent('data_sync_check', { user_id: user?.id, sync_status: 'fail', records_affected: 0, module_name: 'UserPage' });
            throw error;
        }
    };

    const handleIncomeSubmit = async (values) => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }
        try {
            const startedAt = performance.now();
            if (editingIncome) {
                const saved = await updateIncome(editingIncome.id, values, user.id);
                message.success('Доход успешно обновлен');
                trackInteraction('record_action_click', { user_id: user.id, action_type: 'update', entity_id: String(editingIncome.id) });
                trackConversion('record_saved', { user_id: user.id, record_id: saved.id, amount_value: Number(saved.amount || values.amount || 0) });
                trackSystemEvent('tax_auto_recalc', {
                    user_id: user.id,
                    calc_duration_ms: Math.round(performance.now() - startedAt),
                    trigger_event: 'operation_update',
                    module_name: 'UserPage',
                });
            } else {
                const saved = await createIncome(values, user.id);
                message.success('Доход успешно добавлен');
                trackInteraction('record_action_click', { user_id: user.id, action_type: 'create', entity_id: String(saved.id) });
                trackConversion('record_saved', { user_id: user.id, record_id: saved.id, amount_value: Number(saved.amount || values.amount || 0) });
                trackSystemEvent('tax_auto_recalc', {
                    user_id: user.id,
                    calc_duration_ms: Math.round(performance.now() - startedAt),
                    trigger_event: 'operation_create',
                    module_name: 'UserPage',
                });
            }
            trackSystemEvent('data_sync_check', { user_id: user.id, sync_status: 'success', records_affected: 1, module_name: 'UserPage' });
            setIncomeFormVisible(false);
            setEditingIncome(null);
            loadIncome();
        } catch (error) {
            message.error(error.message || 'Ошибка при сохранении дохода');
            trackSystemEvent('error_log_trigger', {
                user_id: user?.id,
                error_code: 'INCOME_SAVE_ERROR',
                module_name: 'UserPage',
                severity: 'warning',
            });
            trackSystemEvent('data_sync_check', { user_id: user?.id, sync_status: 'fail', records_affected: 0, module_name: 'UserPage' });
            throw error;
        }
    };

    const handleExpenseDelete = async (id) => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }
        try {
            await deleteExpense(id, user.id);
            message.success('Расход успешно удален');
            trackInteraction('record_action_click', { user_id: user.id, action_type: 'delete', entity_id: String(id) });
            trackSystemEvent('tax_auto_recalc', { user_id: user.id, calc_duration_ms: 0, trigger_event: 'operation_delete', module_name: 'UserPage' });
            trackSystemEvent('data_sync_check', { user_id: user.id, sync_status: 'success', records_affected: 1, module_name: 'UserPage' });
            loadExpenses();
        } catch (error) {
            message.error(error.message || 'Ошибка при удалении расхода');
            trackSystemEvent('error_log_trigger', {
                user_id: user?.id,
                error_code: 'EXPENSE_DELETE_ERROR',
                module_name: 'UserPage',
                severity: 'warning',
            });
        }
    };

    const handleIncomeDelete = async (id) => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }
        try {
            await deleteIncome(id, user.id);
            message.success('Доход успешно удален');
            trackInteraction('record_action_click', { user_id: user.id, action_type: 'delete', entity_id: String(id) });
            trackSystemEvent('tax_auto_recalc', { user_id: user.id, calc_duration_ms: 0, trigger_event: 'operation_delete', module_name: 'UserPage' });
            trackSystemEvent('data_sync_check', { user_id: user.id, sync_status: 'success', records_affected: 1, module_name: 'UserPage' });
            loadIncome();
        } catch (error) {
            message.error(error.message || 'Ошибка при удалении дохода');
            trackSystemEvent('error_log_trigger', {
                user_id: user?.id,
                error_code: 'INCOME_DELETE_ERROR',
                module_name: 'UserPage',
                severity: 'warning',
            });
        }
    };

    const expenseColumns = [
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <RangePicker
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setSelectedKeys([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
                                } else {
                                    setSelectedKeys([]);
                                }
                            }}
                            format="YYYY-MM-DD"
                        />
                        <Space style={{ marginTop: 8 }}>
                            <Button
                                onClick={() => {
                                    trackInteraction('filter_apply_click', { user_id: user?.id, filter_field: 'expense_date', filter_value: 'range' });
                                    if (Array.isArray(selectedKeys) && selectedKeys.length === 2) {
                                        trackFilterSearchExec(expenses, selectedKeys[0], selectedKeys[1], 'expense_date');
                                    }
                                    confirm();
                                }}
                                size="small"
                                type="primary"
                            >
                                Применить
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedKeys([]);
                                    clearFilters();
                                    trackInteraction('filter_apply_click', { user_id: user?.id, filter_field: 'expense_date', filter_value: 'reset' });
                                    confirm();
                                }}
                                size="small"
                            >
                                Сбросить
                            </Button>
                        </Space>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                if (!value || value.length !== 2) return true;
                const recordDate = dayjs(record.date);
                const startDate = dayjs(value[0]);
                const endDate = dayjs(value[1]);
                return recordDate.isSameOrAfter(startDate, 'day') && recordDate.isSameOrBefore(endDate, 'day');
            },
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount) => `${parseFloat(amount || 0).toFixed(2)} руб.`,
            sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
        },
        {
            title: 'Тип',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            filters: getExpenseTypeFilters(),
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => {
                            setEditingExpense(record);
                            setExpenseFormVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Вы уверены, что хотите удалить этот расход?"
                        onConfirm={() => handleExpenseDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const incomeColumns = [
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <RangePicker
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setSelectedKeys([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
                                } else {
                                    setSelectedKeys([]);
                                }
                            }}
                            format="YYYY-MM-DD"
                        />
                        <Space style={{ marginTop: 8 }}>
                            <Button
                                onClick={() => {
                                    trackInteraction('filter_apply_click', { user_id: user?.id, filter_field: 'income_date', filter_value: 'range' });
                                    if (Array.isArray(selectedKeys) && selectedKeys.length === 2) {
                                        trackFilterSearchExec(income, selectedKeys[0], selectedKeys[1], 'income_date');
                                    }
                                    confirm();
                                }}
                                size="small"
                                type="primary"
                            >
                                Применить
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedKeys([]);
                                    clearFilters();
                                    trackInteraction('filter_apply_click', { user_id: user?.id, filter_field: 'income_date', filter_value: 'reset' });
                                    confirm();
                                }}
                                size="small"
                            >
                                Сбросить
                            </Button>
                        </Space>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                if (!value || value.length !== 2) return true;
                const recordDate = dayjs(record.date);
                const startDate = dayjs(value[0]);
                const endDate = dayjs(value[1]);
                return recordDate.isSameOrAfter(startDate, 'day') && recordDate.isSameOrBefore(endDate, 'day');
            },
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount) => `${parseFloat(amount || 0).toFixed(2)} руб.`,
            sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
        },
        {
            title: 'Источник',
            dataIndex: 'source',
            key: 'source',
            width: 200,
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => {
                            setEditingIncome(record);
                            setIncomeFormVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Вы уверены, что хотите удалить этот доход?"
                        onConfirm={() => handleIncomeDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <UserHeader />
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2>Расходы</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingExpense(null);
                            setExpenseFormVisible(true);
                        }}
                        style={{ marginBottom: '16px' }}
                    >
                        Записать расход
                    </Button>
                    <Table
                        columns={expenseColumns}
                        dataSource={expenses}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 7 }}
                    />
                </div>

                <div style={{ marginTop: '32px' }}>
                    <h2>Доходы</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingIncome(null);
                            setIncomeFormVisible(true);
                        }}
                        style={{ marginBottom: '16px' }}
                    >
                        Записать доход
                    </Button>
                    <Table
                        columns={incomeColumns}
                        dataSource={income}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 7 }}
                    />
                </div>
            </div>

            <ExpenseForm
                visible={expenseFormVisible}
                onCancel={() => {
                    setExpenseFormVisible(false);
                    setEditingExpense(null);
                }}
                onSubmit={handleExpenseSubmit}
                initialData={editingExpense}
            />

            <IncomeForm
                visible={incomeFormVisible}
                onCancel={() => {
                    setIncomeFormVisible(false);
                    setEditingIncome(null);
                }}
                onSubmit={handleIncomeSubmit}
                initialData={editingIncome}
            />
        </div>
    );
}

export default UserPage;
