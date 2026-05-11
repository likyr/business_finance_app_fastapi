import { Spin } from 'antd';

/**
 * Компонент для отображения состояния загрузки
 * @param {string} message - Сообщение во время загрузки
 */
function LoadingSpinner({ message: loadingMessage = 'Загрузка данных...' }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#999' }}>{loadingMessage}</p>
        </div>
    );
}

export default LoadingSpinner;














