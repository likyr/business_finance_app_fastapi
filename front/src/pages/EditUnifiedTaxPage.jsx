import { useState, useEffect, useMemo } from 'react';
import { Table, Card, InputNumber, message, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/Header/AdminHeader';
import { getRegions, getActivityTypes, getUnifiedTaxRates, updateUnifiedTaxRate } from '../api/taxes';
import LoadingSpinner from '../components/LoadingSpinner';
import { trackInteraction, trackScreenView } from '../api/events';

function EditUnifiedTaxPage() {
    const navigate = useNavigate();
    const [regions, setRegions] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [taxRates, setTaxRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});

    // Загрузка данных
    const loadData = async () => {
        setLoading(true);
        try {
            const [regionsData, activityTypesData, ratesData] = await Promise.all([
                getRegions(),
                getActivityTypes(),
                getUnifiedTaxRates()
            ]);

            // Обработка регионов
            const processedRegions = Array.isArray(regionsData)
                ? regionsData.map(item => typeof item === 'string' ? item : (item.name || item.value || item))
                : Object.keys(regionsData);

            // Обработка видов деятельности
            const processedActivityTypes = Array.isArray(activityTypesData)
                ? activityTypesData.map(item => typeof item === 'string' ? item : (item.name || item.value || item))
                : Object.keys(activityTypesData);

            setRegions(processedRegions);
            setActivityTypes(processedActivityTypes);

            // Обработка ставок налога
            let processedRates = {};
            
            if (Array.isArray(ratesData)) {
                // Формат: [{ region: "Минск", activity_type: "Торговля", rate: 50.0 }, ...]
                ratesData.forEach(item => {
                    const region = item.region || item.region_name;
                    const activityType = item.activity_type || item.activity_type_name;
                    const rate = item.rate || item.value || 0;
                    if (region && activityType) {
                        if (!processedRates[region]) {
                            processedRates[region] = {};
                        }
                        processedRates[region][activityType] = rate;
                    }
                });
            } else if (typeof ratesData === 'object' && ratesData !== null) {
                // Формат: { "Минск": { "Торговля": 50.0, "Услуги": 30.0 }, ... }
                processedRates = ratesData;
            }

            setTaxRates(processedRates);
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        trackScreenView('tax_settings_view', { tax_mode: 'unified' });
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработка изменения значения в ячейке
    const handleRateChange = async (region, activityType, value) => {
        const key = `${region}_${activityType}`;
        setSaving(prev => ({ ...prev, [key]: true }));
        const oldValue = taxRates[region]?.[activityType] ?? 0;

        try {
            await updateUnifiedTaxRate(region, activityType, value || 0);
            
            // Обновляем локальное состояние
            setTaxRates(prev => ({
                ...prev,
                [region]: {
                    ...prev[region],
                    [activityType]: value || 0,
                },
            }));

            message.success('Ставка успешно обновлена');
            trackInteraction('tax_param_update', {
                param_name: `${region}:${activityType}`,
                old_value: String(oldValue),
            });
        } catch (error) {
            message.error(error.message || 'Ошибка при обновлении ставки');
        } finally {
            setSaving(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        }
    };

    // Формирование колонок таблицы
    const columns = useMemo(() => {
        const baseColumns = [
            {
                title: 'Вид деятельности',
                dataIndex: 'activityType',
                key: 'activityType',
                fixed: 'left',
                width: 200,
                render: (text) => <strong>{text}</strong>,
            },
        ];

        const regionColumns = regions.map(region => ({
            title: region,
            key: region,
            dataIndex: region,
            width: 150,
            align: 'center',
            render: (_, record) => {
                const currentRate = taxRates[region]?.[record.activityType] ?? 0;
                const key = `${region}_${record.activityType}`;
                const isSaving = saving[key];

                return (
                    <InputNumber
                        value={currentRate}
                        min={0}
                        step={0.01}
                        precision={2}
                        style={{ width: '100%' }}
                        disabled={isSaving}
                        onChange={(value) => handleRateChange(region, record.activityType, value)}
                        addonAfter="₽"
                        placeholder="0.00"
                    />
                );
            },
        }));

        return [...baseColumns, ...regionColumns];
    }, [regions, taxRates, saving]);

    // Формирование данных для таблицы
    const tableData = useMemo(() => {
        return activityTypes.map(activityType => ({
            key: activityType,
            activityType,
        }));
    }, [activityTypes]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <AdminHeader />
            <div style={{ 
                padding: '24px', 
                maxWidth: '100%', 
                margin: '0 auto',
                overflowX: 'auto'
            }}>
                <Card
                    title="Редактирование данных о Едином налоге"
                    extra={
                        <Space>
                            <Button onClick={() => navigate('/admin')}>
                                Назад
                            </Button>
                        </Space>
                    }
                    style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {loading ? (
                        <LoadingSpinner message="Загрузка данных..." />
                    ) : regions.length === 0 || activityTypes.length === 0 ? (
                        <p>Нет данных о регионах или видах деятельности</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <Table
                                columns={columns}
                                dataSource={tableData}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                bordered
                                size="middle"
                                style={{
                                    minWidth: 400 + regions.length * 150,
                                }}
                            />
                            <div style={{ marginTop: '16px', color: '#666', fontSize: '12px' }}>
                                <p>💡 Нажмите на ячейку для редактирования ставки единого налога за месяц (в рублях)</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default EditUnifiedTaxPage;
