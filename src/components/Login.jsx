/* 
Компонент Login. Используется для отображения формы входа в систему. 
Данный компонент содержит форму входа, логотип приложения и кнопку перехода на страницу регистрации. 
*/
import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import { useLoginMutation } from '../slices/api/usersApi';

// Компонент страницы входа в систему
function Login() {
    // Хук для навигации между страницами
    const navigate = useNavigate();
    // Состояние для хранения email пользователя
    const [email, setEmail] = useState('');
    // Состояние для хранения пароля пользователя
    const [password, setPassword] = useState('');
    // Состояние для хранения ошибок валидации формы
    const [errors, setErrors] = useState({});
    // Состояние для отслеживания процесса отправки формы
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // RTK Query мутация для входа пользователя с состоянием загрузки
    const [loginMutation, { isLoading: authLoading }] = useLoginMutation();

    // Функция валидации формы входа
    const validateForm = () => {
        const errors = {};
        
        // Проверка наличия и формата email
        if (!email.trim()) errors.email = 'Email обязателен!';
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Неверный формат email!';
        
        // Проверка наличия пароля
        if (!password) errors.password = 'Пароль обязателен!';
        
        return errors;
    };

    // Обработчик отправки формы входа
    const handleSubmit = async (event) => {
        // Предотвращение стандартного поведения формы
        event.preventDefault();
        // Установка состояния отправки
        setIsSubmitting(true);
        // Сброс предыдущих ошибок
        setErrors({});
        
        // Валидация формы
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            // Формирование объекта с учетными данными
            const credentials = { email, password };
            // Вызов мутации входа
            const result = await loginMutation(credentials).unwrap();
            // Перенаправление на страницу профиля после успешного входа
            navigate('/profile');
            
        } catch (error) {
            // Обработка ошибок входа с извлечением детального сообщения
            const errorMessage = error.data?.detail || error.data?.message || error.message || 'Неверный email или пароль';
            setErrors({ general: errorMessage });
        } finally {
            // Сброс состояния отправки формы
            setIsSubmitting(false);
        }
    };
    
    return (
        <>
        {/* Отображение компонентов шапки, основного содержимого и подвала */}
        <Header />
        <div className="login">
            {/* Индикатор загрузки при отправке формы */}
            {(authLoading || isSubmitting) && <Loader />}
            <h1 className="login__heading">Вход в профиль</h1>
            <form className="login__form" onSubmit={handleSubmit}>
                <label>
                    Электронная почта:
                    <input type="email" name="email" className="login__form__input" value={email} 
                        onChange={(e) => setEmail(e.target.value)} required disabled={authLoading || isSubmitting}/>
                </label>
                {/* Отображение ошибок валидации email */}
                {errors.email && <div className="login__error">{errors.email}</div>}
                <label>
                    Пароль:
                    <input type="password" name="password" className="login__form__input" value={password} 
                        onChange={(e) => setPassword(e.target.value)} required disabled={authLoading || isSubmitting}/>
                </label>
                {/* Отображение ошибок валидации пароля */}
                {errors.password && <span className="login__error">{errors.password}</span>}
                {/* Отображение общих ошибок (например, неверные учетные данные) */}
                {errors.general && <div className="login__error">{errors.general}</div>}
                {/* Кнопка отправки формы */}
                <input type="submit" value={authLoading || isSubmitting ? "Вход..." : "Войти"} className="login__form__submit"
                    disabled={authLoading || isSubmitting} formNoValidate/>
            </form>
            <div className="login__question-block">
                <p>Ещё нет профиля?</p>
                {/* Ссылка на страницу регистрации */}
                <Link to="/registration" className="login__question-btn">Зарегистрироваться</Link>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Login;