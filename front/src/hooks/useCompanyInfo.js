import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getCompanyInfo } from '../api/taxes';

/**
 * Хук для загрузки информации о компании пользователя
 * @param {number} userId - ID пользователя
 * @returns {Object} Объект с данными компании и состоянием загрузки
 */
export const useCompanyInfo = (userId) => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompanyInfo = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await getCompanyInfo(userId);
                setCompanyInfo(data);
            } catch (error) {
                message.error(error.message || 'Ошибка при загрузке данных компании');
            } finally {
                setLoading(false);
            }
        };

        loadCompanyInfo();
    }, [userId]);

    return {
        companyInfo,
        loading
    };
};














