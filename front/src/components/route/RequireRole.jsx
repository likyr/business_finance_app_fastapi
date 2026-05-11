import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RequireRole({ allow, children }) {
    const { user } = useAuth()
    const location = useLocation()

    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />
    }

    const allowed = Array.isArray(allow) ? allow : [allow]
    if (user.role && allowed.includes(user.role)) {
        return children
    }

    // Если пользователь не имеет доступа к этой странице, перенаправляем его на его страницу
    if (user.role === 'Admin') {
        return <Navigate to="/admin" replace />
    } else if (user.role === 'User') {
        return <Navigate to="/user" replace />
    }

    return <Navigate to="/" replace />
}

export default RequireRole
