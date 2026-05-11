import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/AuthForm'
import { trackConversion, trackScreenView } from '../api/events'

function AuthPage() {
    const [isRegisterMode, setIsRegisterMode] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const { setUser } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        trackScreenView('auth_page_view', {
            entry_source: 'direct',
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        })
    }, [])

    const handleSubmit = async (email, password) => {
        setErrorMessage('')
        setSuccessMessage('')
        const startedAt = performance.now()
        
        try {
            const apiCall = isRegisterMode ? register : login
            const data = await apiCall(email, password)

            if (!data.user) {
                throw new Error('Ошибка: пользователь не получен от сервера')
            }
            
            setUser(data.user)
            setSuccessMessage(isRegisterMode ? 'Регистрация успешна!' : 'Вход выполнен успешно!')

            if (!isRegisterMode) {
                trackConversion('auth_success', {
                    user_id: data.user.id,
                    auth_time_ms: Math.round(performance.now() - startedAt),
                })
            }


            if (data.user.role === "Admin") {
                navigate('/admin', { replace: true })
            } else {
                navigate('/user', { replace: true })
            }
        } catch (error) {
            const errorText = error.message || 'Произошла ошибка. Попробуйте ещё раз.'
            setErrorMessage(errorText)
            console.error('Ошибка авторизации:', error)
    
            throw error
        }
    }

    return (
        <AuthForm
            isRegisterMode={isRegisterMode}
            setIsRegisterMode={setIsRegisterMode}
            onSubmit={handleSubmit}
            errorMessage={errorMessage}
            successMessage={successMessage}
        />
    )
}

export default AuthPage

