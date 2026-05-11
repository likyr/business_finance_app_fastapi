import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

function IncomeForm({ visible, onCancel, onSubmit, initialData = null }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialData) {
                // Убираем id и user_id из данных формы, т.к. они не должны попадать в тело запроса
                const { id: _id, user_id: _user_id, ...formData } = initialData;
                form.setFieldsValue({
                    ...formData,
                    amount: formData.amount ? parseFloat(formData.amount) : null,
                    date: formData.date ? dayjs(formData.date) : null,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                date: values.date ? values.date.format('YYYY-MM-DD') : null,
            };
            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            if (error.errorFields) {
                message.error('Пожалуйста, заполните все обязательные поля');
            } else {
                message.error(error.message || 'Ошибка при сохранении дохода');
            }
        }
    };

    return (
        <Modal
            title={initialData ? 'Редактировать доход' : 'Добавить доход'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            okText="Сохранить"
            cancelText="Отмена"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    date: dayjs(),
                }}
            >
                <Form.Item
                    name="date"
                    label="Дата"
                    rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
                >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Название"
                    rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
                >
                    <Input placeholder="Название дохода" />
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Сумма"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите сумму' },
                        { type: 'number', min: 0.01, message: 'Сумма должна быть больше 0' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Сумма"
                        min={0}
                        step={0.01}
                        precision={2}
                    />
                </Form.Item>

                <Form.Item
                    name="source"
                    label="Источник"
                    rules={[{ required: true, message: 'Пожалуйста, введите источник' }]}
                >
                    <Input placeholder="Источник дохода" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Описание"
                >
                    <TextArea rows={4} placeholder="Описание (необязательно)" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default IncomeForm;

