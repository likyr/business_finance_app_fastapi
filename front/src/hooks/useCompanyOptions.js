import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getTaxSystems, getRegions, getActivityTypes } from '../api/taxes';

/**
 * Хук для загрузки опций формы компании
 * @returns {Object} Объект с опциями и состоянием загрузки
 */
export const useCompanyOptions = () => {
    const [taxSystems, setTaxSystems] = useState([]);
    const [regions, setRegions] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOptions = async () => {
            setLoading(true);
            try {
                const [taxSystemsData, regionsData, activityTypesData] = await Promise.all([
                    getTaxSystems(),
                    getRegions(),
                    getActivityTypes()
                ]);

                // Обработка данных: если это массив объектов, извлекаем значения, иначе используем как есть
                const processOptions = (data) => {
                    if (!data || !Array.isArray(data) || data.length === 0) return [];
                    // Если первый элемент - строка, возвращаем как есть
                    if (typeof data[0] === 'string') return data;
                    // Если первый элемент - объект, извлекаем name или value
                    return data.map(item => item.name || item.value || item);
                };

                setTaxSystems(processOptions(taxSystemsData));
                setRegions(processOptions(regionsData));
                setActivityTypes(processOptions(activityTypesData));
            } catch (error) {
                message.error(error.message || 'Ошибка при загрузке опций');
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, []);

    return {
        taxSystems,
        regions,
        activityTypes,
        loading
    };
};














