import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * Компонент кнопки "Назад"
 * @param {string} to - Путь для перехода
 * @param {string} label - Текст кнопки
 */
function BackButton({ to, label = 'Назад' }) {
    const navigate = useNavigate();

    return (
        <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(to)}
            style={{ marginBottom: '24px' }}
        >
            {label}
        </Button>
    );
}

export default BackButton;














