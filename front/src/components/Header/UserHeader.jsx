import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'antd';

function UserHeader() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    return (
        <header style={{
            padding: '16px 24px',
            backgroundColor: '#001529',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ color: '#fff', margin: 0 }}>Финансовый менеджер</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="link" style={{ color: '#fff' }} onClick={() => navigate('/user')}>
                    Главная
                </Button>
                <Button type="primary" onClick={() => navigate('/user/taxes')}>
                    Налоги
                </Button>
                <Button type="primary" onClick={() => navigate('/user/analytics')}>
                    Аналитика
                </Button>
                <Button danger onClick={handleLogout}>
                    Выйти
                </Button>
            </div>
        </header>
    );
}

export default UserHeader;

