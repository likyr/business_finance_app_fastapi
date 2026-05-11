import { useState, useEffect } from 'react';
import { Button, Form, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/Header/UserHeader';
import { useAuth } from '../context/AuthContext';
import { updateCompanyInfo } from '../api/taxes';
import { useCompanyOptions } from '../hooks/useCompanyOptions';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import CompanyFormFields from '../components/CompanyFormFields';
import BackButton from '../components/BackButton';
import { trackConversion, trackScreenView } from '../api/events';

function EditCompanyPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    // Загрузка опций (системы налогообложения, регионы, виды деятельности)
    const { taxSystems, regions, activityTypes, loading: optionsLoading } = useCompanyOptions();
    
    // Загрузка информации о компании
    const { companyInfo, loading: companyLoading } = useCompanyInfo(user?.id);

    // Установка значений формы при загрузке данных компании
    useEffect(() => {
        if (companyInfo && !companyLoading) {
            trackScreenView('org_settings_view', {
                user_id: user?.id,
                profile_status: companyInfo.company_name ? 'filled' : 'draft',
            });
            form.setFieldsValue({
                tax_system: companyInfo.tax_system || undefined,
                company_name: companyInfo.company_name || '',
                unp: companyInfo.unp || '',
                region: companyInfo.region || undefined,
                activity_type: companyInfo.activity_type || undefined,
            });
        }
    }, [companyInfo, companyLoading, form]);

    const isLoading = optionsLoading || companyLoading;

    // Обработка сохранения формы
    const handleSubmit = async (values) => {
        if (!user?.id) {
            message.error('Пользователь не авторизован');
            return;
        }

        setSaving(true);
        const startedAt = performance.now();
        try {
            const saved = await updateCompanyInfo(user.id, values);
            message.success('Данные компании успешно обновлены');
            trackConversion('org_profile_saved', {
                user_id: user.id,
                org_id: saved.id,
                completion_time: Math.round(performance.now() - startedAt),
            });
            navigate('/user/taxes');
        } catch (error) {
            message.error(error.message || 'Ошибка при сохранении данных компании');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <UserHeader />
            <div style={{ 
                padding: '24px', 
                maxWidth: '800px', 
                margin: '0 auto'
            }}>
                <BackButton to="/user/taxes" label="Назад к налогам" />
                
                <Card
                    title="Изменение данных о компании"
                    style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {isLoading ? (
                        <LoadingSpinner message="Загрузка данных..." />
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <CompanyFormFields
                                taxSystems={taxSystems}
                                regions={regions}
                                activityTypes={activityTypes}
                            />

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={saving}
                                    style={{ marginRight: '8px' }}
                                >
                                    Сохранить
                                </Button>
                                <Button onClick={() => navigate('/user/taxes')}>
                                    Отмена
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default EditCompanyPage;

