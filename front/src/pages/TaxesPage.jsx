import { useState, useEffect } from 'react';
import { Card, Button, Table, Select, Space, message, Row, Col, Descriptions } from 'antd';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/Header/UserHeader';
import { useAuth } from '../context/AuthContext';
import { getCompanyInfo, getTaxes, createTaxReport } from '../api/taxes';
import dayjs from 'dayjs';
import { trackConversion, trackInteraction, trackSystemEvent } from '../api/events';

const { Option } = Select;

function TaxesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [taxesData, setTaxesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [periodType, setPeriodType] = useState('month'); // month или quarter
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Загрузка информации об организации
    const loadCompanyInfo = async () => {
        if (!user?.id) return;
        try {
            const data = await getCompanyInfo(user.id);
            setCompanyInfo(data);
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке информации об организации');
        }
    };

    // Загрузка налоговой нагрузки
    const loadTaxes = async () => {
        if (!user?.id) return;
        setLoading(true);
        const startedAt = performance.now();
        try {
            const period = getPeriodValue();
            const data = await getTaxes(user.id, periodType, period);
            setTaxesData(data || []);
            trackSystemEvent('tax_auto_recalc', {
                user_id: user.id,
                calc_duration_ms: Math.round(performance.now() - startedAt),
                trigger_event: 'period_change',
                module_name: 'TaxesPage',
            });
            trackSystemEvent('data_sync_check', {
                user_id: user.id,
                sync_status: 'success',
                records_affected: (data || []).length,
                module_name: 'TaxesPage',
            });
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке налоговой нагрузки');
            trackSystemEvent('error_log_trigger', {
                user_id: user?.id,
                error_code: 'TAX_LOAD_ERROR',
                module_name: 'TaxesPage',
                severity: 'warning',
            });
            trackSystemEvent('data_sync_check', {
                user_id: user?.id,
                sync_status: 'fail',
                records_affected: 0,
                module_name: 'TaxesPage',
            });
        } finally {
            setLoading(false);
        }
    };

    // Получение значения периода для API
    const getPeriodValue = () => {
        if (!selectedYear || !selectedPeriod) return null;
        
        if (periodType === 'quarter') {
            const quarter = selectedPeriod;
            return `${selectedYear}-Q${quarter}`;
        } else if (periodType === 'month') {
            const month = String(selectedPeriod).padStart(2, '0');
            return `${selectedYear}-${month}`;
        }
        
        return null;
    };

    // Генерация опций для селектора года
    const getYearOptions = () => {
        const options = [];
        const currentYear = dayjs().year();
        for (let year = currentYear; year >= currentYear - 5; year--) {
            options.push({ label: year.toString(), value: year });
        }
        return options;
    };

    // Генерация опций для селектора периода (месяц/квартал)
    const getPeriodOptions = () => {
        if (!selectedYear) return [];
        
        const options = [];
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1;
        const currentQuarter = Math.ceil(currentMonth / 3);
        
        if (periodType === 'quarter') {
            for (let q = 1; q <= 4; q++) {
                if (selectedYear === currentYear && q > currentQuarter) continue;
                options.push({ label: `${q} квартал`, value: q });
            }
        } else if (periodType === 'month') {
            const months = [
                'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
            ];
            for (let month = 1; month <= 12; month++) {
                if (selectedYear === currentYear && month > currentMonth) continue;
                options.push({ label: months[month - 1], value: month });
            }
        }
        
        return options;
    };

    // Обработка создания отчета
    const handleCreateReport = async () => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }

        if (periodType !== 'quarter') {
            message.warning('Отчет можно сформировать только для квартала');
            return;
        }

        if (!selectedYear || !selectedPeriod) {
            message.warning('Выберите год и период для формирования отчета');
            return;
        }

        setReportLoading(true);
        const startedAt = performance.now();
        try {
            const period = getPeriodValue();
            trackInteraction('report_generate_click', {
                user_id: user.id,
                report_type: 'tax_quarter_report',
                period_days: 90,
            });
            trackInteraction('export_click', {
                user_id: user.id,
                file_format: 'docx_or_pdf',
                report_id: period,
            });
            const result = await createTaxReport(user.id, periodType, period);
            message.success(`Отчет "${result.filename}" успешно скачан`);
            const format = result.filename?.split('.').pop() || 'unknown';
            trackConversion('report_generated', {
                user_id: user.id,
                report_id: period,
                calc_duration_ms: Math.round(performance.now() - startedAt),
            });
            trackConversion('export_completed', {
                user_id: user.id,
                format,
                file_size_kb: 0,
            });
        } catch (error) {
            message.error(error.message || 'Ошибка при создании отчета');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            loadCompanyInfo();
        }
    }, [user?.id]);

    useEffect(() => {
        // Сбрасываем выбранный период при изменении года или типа периода
        setSelectedPeriod(null);
    }, [selectedYear, periodType]);

    useEffect(() => {
        if (user?.id && selectedYear && selectedPeriod) {
            loadTaxes();
        }
    }, [user?.id, selectedYear, periodType, selectedPeriod]);

    // Вычисление общей суммы всех налогов
    const totalTaxAmount = taxesData.reduce((sum, tax) => {
        return sum + parseFloat(tax.amount || 0);
    }, 0);

    // Формирование данных для таблицы (одна строка с общей суммой)
    const tableData = taxesData.length > 0 ? [{
        key: 'total',
        tax_name: taxesData[0]?.tax_name || 'Налог',
        amount: totalTaxAmount
    }] : [];

    const columns = [
        {
            title: 'Тип налога',
            dataIndex: 'tax_name',
            key: 'tax_name',
            width: 250,
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            render: (amount) => `${parseFloat(amount || 0).toFixed(2)} руб.`,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <UserHeader />
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Карточка с информацией об организации */}
                <Card
                    title="Информация об организации"
                    extra={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate('/user/taxes/edit-company')}
                        >
                            Изменить данные о компании
                        </Button>
                    }
                    style={{ marginBottom: '24px' }}
                >
                    {companyInfo ? (
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Название системы налогообложения">
                                {companyInfo.tax_system || 'Не указано'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Название компании">
                                {companyInfo.company_name || 'Не указано'}
                            </Descriptions.Item>
                            <Descriptions.Item label="УНП">
                                {companyInfo.unp || 'Не указано'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Регион">
                                {companyInfo.region || 'Не указано'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Вид деятельности" span={2}>
                                {companyInfo.activity_type || 'Не указано'}
                            </Descriptions.Item>
                        </Descriptions>
                    ) : (
                        <p>Загрузка данных...</p>
                    )}
                </Card>

                {/* Фильтры и управление */}
                <Card
                    title="Налоговая нагрузка"
                    style={{ marginBottom: '24px' }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col>
                            <span>Год:</span>
                        </Col>
                        <Col>
                            <Select
                                value={selectedYear}
                                onChange={(value) => {
                                    setSelectedYear(value);
                                    setSelectedPeriod(null);
                                }}
                                placeholder="Выберите год"
                                style={{ width: 120 }}
                                options={getYearOptions()}
                            />
                        </Col>
                        <Col>
                            <span>Тип периода:</span>
                        </Col>
                        <Col>
                            <Select
                                value={periodType}
                                onChange={(value) => {
                                    setPeriodType(value);
                                    setSelectedPeriod(null);
                                }}
                                style={{ width: 130 }}
                                disabled={!selectedYear}
                            >
                                <Option value="month">Месяц</Option>
                                <Option value="quarter">Квартал</Option>
                            </Select>
                        </Col>
                        <Col>
                            <Select
                                value={selectedPeriod}
                                onChange={setSelectedPeriod}
                                placeholder={`Выберите ${periodType === 'month' ? 'месяц' : 'квартал'}`}
                                style={{ width: 180 }}
                                disabled={!selectedYear}
                                options={getPeriodOptions()}
                            />
                        </Col>
                        <Col flex="auto">
                            <Space style={{ float: 'right' }}>
                                <Button
                                    type="primary"
                                    icon={<FileTextOutlined />}
                                    onClick={handleCreateReport}
                                    loading={reportLoading}
                                    disabled={!selectedYear || !selectedPeriod || periodType !== 'quarter'}
                                    title={periodType !== 'quarter' ? 'Отчет доступен только для квартала' : undefined}
                                >
                                    Создать отчет
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Таблица налогов */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        loading={loading}
                        rowKey="key"
                        pagination={false}
                        locale={{
                            emptyText: selectedYear && selectedPeriod 
                                ? 'Нет данных за выбранный период' 
                                : 'Выберите год и период для отображения данных'
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}

export default TaxesPage;
