import { useState, useEffect } from 'react';
import { Select, DatePicker, Card, Statistic, Row, Col, message, Spin } from 'antd';
import { DollarOutlined, RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import UserHeader from '../components/Header/UserHeader';
import { useAuth } from '../context/AuthContext';
import {
    getProfitAndProfitability,
    getIncomeExpenseChart,
    getExpenseTypesChart,
    getProfitByMonths,
    getExpensesByTypes
} from '../api/analytics';
import { EXPENSE_TYPES } from '../constants/expenseTypes';
import { trackInteraction, trackScreenView } from '../api/events';

const { Option } = Select;

const COLORS = ['#0062ff', '#00c48c', '#ff9f0a', '#ff4d4f', '#9254de', '#13c2c2', '#fa8c16'];

const cardBody = { padding: '20px 24px' };
const kpiTitleStyle = { fontSize: 16, fontWeight: 600 };
const kpiCardStyle = (bg, border) => ({
    background: bg,
    border: `1px solid ${border}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
});

function AnalyticsPage() {
    const { user } = useAuth();
    const [periodType, setPeriodType] = useState('month'); // 'month', 'quarter', 'year'
    const [periodValue, setPeriodValue] = useState(dayjs().format('YYYY-MM'));
    const [loading, setLoading] = useState(false);

    // Данные для графиков
    const [profitData, setProfitData] = useState(null);
    const [incomeExpenseData, setIncomeExpenseData] = useState([]);
    const [expenseTypesData, setExpenseTypesData] = useState([]);
    const [profitByMonthsData, setProfitByMonthsData] = useState([]);
    const [expensesByTypesData, setExpensesByTypesData] = useState([]);

    // Форматирование значения периода в зависимости от типа
    const formatPeriodValue = (type, value) => {
        const date = dayjs.isDayjs(value) ? value : dayjs(value);
        if (type === 'month') {
            return date.format('YYYY-MM');
        } else if (type === 'quarter') {
            const quarter = Math.floor(date.month() / 3) + 1;
            return `${date.year()}-Q${quarter}`;
        } else {
            return date.format('YYYY');
        }
    };

    const loadAnalytics = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const formattedPeriod = formatPeriodValue(periodType, periodValue);

            // Загружаем все данные параллельно
            const [
                profit,
                incomeExpense,
                expenseTypes,
                profitByMonths,
                expensesByTypes
            ] = await Promise.all([
                getProfitAndProfitability(user.id, periodType, formattedPeriod),
                getIncomeExpenseChart(user.id, periodType, formattedPeriod),
                getExpenseTypesChart(user.id, periodType, formattedPeriod),
                getProfitByMonths(user.id, periodType, formattedPeriod),
                getExpensesByTypes(user.id, periodType, formattedPeriod)
            ]);

            setProfitData(profit);
            setIncomeExpenseData(incomeExpense || []);
            setExpenseTypesData(expenseTypes || []);
            setProfitByMonthsData(profitByMonths || []);
            setExpensesByTypesData(expensesByTypes || []);
            trackScreenView('analytics_dashboard_view', {
                user_id: user.id,
                period_range: formattedPeriod,
                metrics_count: 5,
            });
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке данных аналитики');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, periodType, periodValue]);

    // Обработчик изменения типа периода
    const handlePeriodTypeChange = (value) => {
        setPeriodType(value);
        // Сбрасываем значение периода при смене типа
        if (value === 'month') {
            setPeriodValue(dayjs().format('YYYY-MM'));
        } else if (value === 'quarter') {
            setPeriodValue(dayjs());
        } else {
            setPeriodValue(dayjs().format('YYYY'));
        }
    };

    // Обработчик изменения значения периода
    const handlePeriodValueChange = (value) => {
        if (value) {
            setPeriodValue(value);
        }
    };

    const formatDate = (dateStr) => {
        if (periodType === 'month') {
            return dayjs(dateStr).format('DD.MM');
        } else if (periodType === 'quarter') {
            return dayjs(dateStr).format('MMM');
        } else {
            return dayjs(dateStr).format('MMM YYYY');
        }
    };

    const getProfitChartTitle = () => {
        if (periodType === 'month') {
            return 'Чистая прибыль по дням';
        } else if (periodType === 'quarter') {
            return 'Чистая прибыль по месяцам';
        } else {
            return 'Чистая прибыль по месяцам';
        }
    };

    const incomeExpenseChartData = incomeExpenseData.map(item => ({
        date: item.date || item.period,
        income: parseFloat(item.income || item.income_amount || 0),
        expense: parseFloat(item.expense || item.expense_amount || 0)
    }));

    const pieData = expenseTypesData.map((item, index) => ({
        name: item.type || item.name || item.expense_type || `Тип ${index + 1}`,
        value: parseFloat(item.amount || item.value || item.total || 0)
    }));

    const profitByMonthsChartData = profitByMonthsData.map(item => ({
        month: item.month || item.period || item.date,
        profit: parseFloat(item.profit || item.net_profit || 0)
    }));

    const expensesByTypesChartData = expensesByTypesData.map(item => {
        const result = {
            date: formatDate(item.date || item.month || item.period)
        };
        EXPENSE_TYPES.forEach(type => {
            result[type] = parseFloat(item[type] || 0);
        });
        return result;
    });

    const renderProfitLegend = () => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, marginTop: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: '#00c853', display: 'inline-block', borderRadius: 2 }} />
                <span style={{ color: '#0a7a29' }}>Чистая прибыль</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: '#ff1744', display: 'inline-block', borderRadius: 2 }} />
                <span style={{ color: '#c41d14' }}>Чистый убыток</span>
            </span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <UserHeader />
            <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
                <Card style={{ marginBottom: '24px' }}>
                    <Row gutter={16} align="middle">
                        <Col>
                            <span style={{ marginRight: '8px' }}>Период:</span>
                            <Select
                                value={periodType}
                                onChange={handlePeriodTypeChange}
                                style={{ width: 120, marginRight: '16px' }}
                            >
                                <Option value="month">Месяц</Option>
                                <Option value="quarter">Квартал</Option>
                                <Option value="year">Год</Option>
                            </Select>
                        </Col>
                        <Col>
                            {periodType === 'month' && (
                                <DatePicker
                                    picker="month"
                                    value={periodValue ? dayjs(periodValue) : null}
                                    onChange={handlePeriodValueChange}
                                    format="YYYY-MM"
                                />
                            )}
                            {periodType === 'quarter' && (
                                <DatePicker
                                    picker="quarter"
                                    value={periodValue ? dayjs(periodValue) : null}
                                    onChange={handlePeriodValueChange}
                                    format="YYYY-[Q]Q"
                                />
                            )}
                            {periodType === 'year' && (
                                <DatePicker
                                    picker="year"
                                    value={periodValue ? dayjs(periodValue) : null}
                                    onChange={handlePeriodValueChange}
                                    format="YYYY"
                                />
                            )}
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={12} md={12}>
                        {(() => {
                            const profitValue = profitData?.net_profit || profitData?.profit || 0;
                            const profitPositive = profitValue >= 0;
                            const profitBg = profitPositive ? '#e8f9f0' : '#fdecec';
                            const profitBorder = profitPositive ? '#b7e2c6' : '#f5c2c0';
                            const profitColor = profitPositive ? '#0a7a29' : '#c41d14';
                            return (
                        <Card
                            bodyStyle={cardBody}
                                style={kpiCardStyle(profitBg, profitBorder)}
                        >
                            <Statistic
                                title="Чистая прибыль"
                                        value={profitValue}
                                precision={2}
                                prefix={<DollarOutlined />}
                                suffix="руб."
                                valueStyle={{
                                            color: profitColor,
                                    fontSize: 32,
                                    fontWeight: 700
                                }}
                                titleStyle={kpiTitleStyle}
                            />
                        </Card>
                            );
                        })()}
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        {(() => {
                            const rentValue = profitData?.profitability || profitData?.profitability_percent || 0;
                            const rentPositive = rentValue >= 0;
                            const rentBg = rentPositive ? '#e7f1ff' : '#fdecec';
                            const rentBorder = rentPositive ? '#b7d4ff' : '#f5c2c0';
                            const rentColor = rentPositive ? '#0958d9' : '#c41d14';
                            return (
                        <Card
                            bodyStyle={cardBody}
                                style={kpiCardStyle(rentBg, rentBorder)}
                        >
                            <Statistic
                                title="Рентабельность"
                                        value={rentValue}
                                precision={2}
                                prefix={<RiseOutlined />}
                                suffix="%"
                                valueStyle={{
                                            color: rentColor,
                                    fontSize: 32,
                                    fontWeight: 700
                                }}
                                titleStyle={kpiTitleStyle}
                            />
                        </Card>
                            );
                        })()}
                    </Col>
                </Row>

                <Spin spinning={loading}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card title="Доходы и расходы" style={{ height: '100%' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart
                                        data={incomeExpenseChartData}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="4 4" stroke="#d9d9d9" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDate}
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                                        <Tooltip
                                            formatter={(value) => `${parseFloat(value).toFixed(2)} руб.`}
                                            labelFormatter={(label) => `Дата: ${formatDate(label)}`}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#00c853"
                                            fill="#b9f6ca"
                                            fillOpacity={0.65}
                                            strokeWidth={3}
                                            name="Доходы"
                                            dot={false}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="#ff1744"
                                            fill="#ffcdd2"
                                            fillOpacity={0.6}
                                            strokeWidth={3}
                                            name="Расходы"
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card title={getProfitChartTitle()} style={{ height: '100%' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart
                                        data={profitByMonthsChartData}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="4 4" stroke="#d9d9d9" />
                                        <XAxis
                                            dataKey="month"
                                            tickFormatter={(value) => {
                                                if (periodType === 'year') {
                                                    return dayjs(value).format('MMM');
                                                }
                                                return value;
                                            }}
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} руб.`} />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            height={40}
                                            content={renderProfitLegend}
                                        />
                                        <Bar dataKey="profit" name="Чистая прибыль">
                                            {profitByMonthsChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.profit >= 0 ? '#00c853' : '#ff1744'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card title="Распределение расходов по типам" style={{ height: '100%' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={104}
                                            dataKey="value"
                                            onClick={() => trackInteraction('chart_drilldown', { user_id: user?.id, metric_name: 'expense_types', chart_id: 'expense_types_pie' })}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} руб.`} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card title="Динамика расходов по типам" style={{ height: '100%' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={expensesByTypesChartData}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="4 4" stroke="#d9d9d9" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                                        <Tooltip
                                            formatter={(value) => `${parseFloat(value).toFixed(2)} руб.`}
                                            labelFormatter={(label) => `Дата: ${label}`}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        {EXPENSE_TYPES.map((type, index) => (
                                            <Line
                                                key={type}
                                                type="monotone"
                                                dataKey={type}
                                                stroke={COLORS[index % COLORS.length]}
                                                strokeWidth={3}
                                                name={type}
                                                connectNulls
                                                dot={false}
                                                onClick={() => trackInteraction('chart_drilldown', { user_id: user?.id, metric_name: type, chart_id: 'expenses_by_types_line' })}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
}

export default AnalyticsPage;