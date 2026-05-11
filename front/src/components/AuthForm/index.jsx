import { useState } from 'react'

function AuthForm({ isRegisterMode, setIsRegisterMode, onSubmit, errorMessage, successMessage }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Ошибки валидации для каждого поля
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')
    
    // Проверка, было ли поле "тронуто" пользователем
    const [emailTouched, setEmailTouched] = useState(false)
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

    // Валидация email
    const validateEmail = (value) => {
        if (!value.trim()) {
            return 'Введите email'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Некорректный email (пример: user@example.com)'
        }
        return ''
    }

    // Валидация пароля
    const validatePassword = (value) => {
        if (!value) {
            return 'Введите пароль'
        }
        if (value.length < 6) {
            return 'Пароль должен быть не менее 6 символов'
        }
        return ''
    }

    // Валидация подтверждения пароля
    const validateConfirmPassword = (value) => {
        if (!value) {
            return 'Повторите пароль'
        }
        if (value !== password) {
            return 'Пароли не совпадают'
        }
        return ''
    }

    // Обработчик изменения email
    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        if (emailTouched) {
            setEmailError(validateEmail(value))
        }
    }

    // Обработчик потери фокуса email
    const handleEmailBlur = () => {
        setEmailTouched(true)
        setEmailError(validateEmail(email))
    }

    // Обработчик изменения пароля
    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        if (passwordTouched) {
            setPasswordError(validatePassword(value))
        }
        // Если есть ошибка в подтверждении пароля, перепроверяем его
        if (confirmPasswordTouched && confirmPassword) {
            setConfirmPasswordError(validateConfirmPassword(confirmPassword))
        }
    }

    // Обработчик потери фокуса пароля
    const handlePasswordBlur = () => {
        setPasswordTouched(true)
        setPasswordError(validatePassword(password))
    }

    // Обработчик изменения подтверждения пароля
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value
        setConfirmPassword(value)
        if (confirmPasswordTouched) {
            setConfirmPasswordError(validateConfirmPassword(value))
        }
    }

    // Обработчик потери фокуса подтверждения пароля
    const handleConfirmPasswordBlur = () => {
        setConfirmPasswordTouched(true)
        setConfirmPasswordError(validateConfirmPassword(confirmPassword))
    }

    // Проверка всей формы перед отправкой
    const validateForm = () => {
        const emailErr = validateEmail(email)
        const passwordErr = validatePassword(password)
        const confirmPasswordErr = isRegisterMode ? validateConfirmPassword(confirmPassword) : ''

        setEmailError(emailErr)
        setPasswordError(passwordErr)
        setConfirmPasswordError(confirmPasswordErr)
        setEmailTouched(true)
        setPasswordTouched(true)
        if (isRegisterMode) {
            setConfirmPasswordTouched(true)
        }

        return !emailErr && !passwordErr && !confirmPasswordErr
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        
        // Проверяем форму перед отправкой
        if (!validateForm()) {
            return
        }

        // Защита от повторной отправки
        if (isSubmitting) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(email, password)
            // Очищаем форму после успешной отправки
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setEmailError('')
            setPasswordError('')
            setConfirmPasswordError('')
            setEmailTouched(false)
            setPasswordTouched(false)
            setConfirmPasswordTouched(false)
        } catch {
            // Ошибка обрабатывается в родительском компоненте
            // Не сбрасываем isSubmitting здесь, чтобы предотвратить повторную отправку
            // setIsSubmitting будет сброшен в finally
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleMode = () => {
        setIsRegisterMode((prev) => !prev)
        setPassword('')
        setConfirmPassword('')
        // Сбрасываем ошибки при переключении режима
        setEmailError('')
        setPasswordError('')
        setConfirmPasswordError('')
        setPasswordTouched(false)
        setConfirmPasswordTouched(false)
    }

    // Проверяем, можно ли отправить форму
    const isFormValid = !emailError && !passwordError && 
                       (!isRegisterMode || !confirmPasswordError) &&
                       email && password && 
                       (!isRegisterMode || confirmPassword)

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f0f2f5'
      }}>
        <div style={{
            width: '100%',
            maxWidth: '420px',
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ margin: 0, marginBottom: '16px', fontSize: '24px', color: '#000' }}>
                {isRegisterMode ? 'Регистрация' : 'Вход'}
            </h1>
            <p style={{ marginTop: 0, marginBottom: '24px', color: '#666' }}>
                {isRegisterMode ? 'Создайте новый аккаунт' : 'Войдите в свой аккаунт'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Поле Email */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#000', fontWeight: 500 }}>E-mail</span>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            placeholder="you@example.com"
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: emailError ? '2px solid #ef4444' : '1px solid #d9d9d9',
                                background: '#fff',
                                color: '#000',
                                outline: 'none'
                            }}
                            autoComplete="email"
                            required
                        />
                        {emailError && (
                            <span style={{
                                color: '#ef4444',
                                fontSize: '14px',
                                marginTop: '-4px'
                            }}>
                                {emailError}
                            </span>
                        )}
                    </label>

                    {/* Поле Пароль */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: '#000', fontWeight: 500 }}>Пароль</span>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            placeholder="Не менее 6 символов"
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: passwordError ? '2px solid #ef4444' : '1px solid #d9d9d9',
                                background: '#fff',
                                color: '#000',
                                outline: 'none'
                            }}
                            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                            required
                        />
                        {passwordError && (
                            <span style={{
                                color: '#ef4444',
                                fontSize: '14px',
                                marginTop: '-4px'
                            }}>
                                {passwordError}
                            </span>
                        )}
                    </label>

                    {/* Поле Подтверждение пароля (только при регистрации) */}
                    {isRegisterMode && (
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ color: '#000', fontWeight: 500 }}>Повторите пароль</span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onBlur={handleConfirmPasswordBlur}
                                placeholder="Повторите пароль"
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: confirmPasswordError ? '2px solid #ef4444' : '1px solid #d9d9d9',
                                    background: '#fff',
                                    color: '#000',
                                    outline: 'none'
                                }}
                                autoComplete="new-password"
                                required
                            />
                            {confirmPasswordError && (
                                <span style={{
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    marginTop: '-4px'
                                }}>
                                    {confirmPasswordError}
                                </span>
                            )}
                        </label>
                    )}

                    {/* Сообщения об ошибках от сервера */}
                    {errorMessage && (
                        <div style={{
                            background: '#fff1f0',
                            border: '1px solid #ffccc7',
                            color: '#cf1322',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            fontSize: '14px'
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    {/* Сообщения об успехе */}
                    {successMessage && (
                        <div style={{
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            color: '#389e0d',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            fontSize: '14px'
                        }}>
                            {successMessage}
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: (isSubmitting || !isFormValid) ? '#d9d9d9' : '#1890ff',
                            color: 'white',
                            cursor: (isSubmitting || !isFormValid) ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            opacity: (isSubmitting || !isFormValid) ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'Отправка...' : (isRegisterMode ? 'Зарегистрироваться' : 'Войти')}
                    </button>

                    {/* Кнопка переключения режима */}
                    <button
                        type="button"
                        onClick={toggleMode}
                        style={{
                            marginTop: '4px',
                            padding: '10px',
                            background: 'transparent',
                            color: '#1890ff',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isRegisterMode ? 'У меня уже есть аккаунт' : 'Создать новый аккаунт'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    )
}

export default AuthForm
