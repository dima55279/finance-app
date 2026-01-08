/* 
Компонент Header. Используется для отображения шапки приложения. 
Данный компонент содержит кнопки для перехода на различные страницы, логотип приложения и кнопку выхода. 
*/
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/api/usersApi';
import { categoriesApi } from '../slices/api/categoriesApi';
import { operationsApi } from '../slices/api/operationsApi';
import logo from '../images/logo.png';

// Основной компонент шапки приложения
function Header() {
    // Хук для навигации между страницами
    const navigate = useNavigate();
    // Хук для отправки действий в Redux store
    const dispatch = useDispatch();
    // RTK Query мутация для выхода пользователя
    const [logoutMutation] = useLogoutMutation();

    // Получение токена доступа и ID пользователя из localStorage
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');

    // Функция для выхода пользователя из системы
    const handleLogout = async () => {
        try {
            // Вызов мутации выхода
            await logoutMutation().unwrap();
            
            // Сброс кэша RTK Query для категорий и операций
            dispatch(categoriesApi.util.resetApiState());
            dispatch(operationsApi.util.resetApiState());
            // Инвалидация тегов для обновления данных
            dispatch(categoriesApi.util.invalidateTags(['Categories']));
            dispatch(operationsApi.util.invalidateTags(['Operations']));
            
            // Перенаправление на главную страницу и перезагрузка приложения
            navigate('/');
            window.location.reload();
        } catch (error) {
            // Обработка ошибки при выходе
            console.error('Ошибка при выходе:', error);
            // Сброс кэша в случае ошибки
            dispatch(categoriesApi.util.resetApiState());
            dispatch(operationsApi.util.resetApiState());
            // Удаление данных пользователя из localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            // Перенаправление на главную страницу
            navigate('/');
        }
    };

    return (
        <header className="header">
            {/* Логотип приложения */}
            <img className="header__logo" src={logo} alt="логотип" />
            <div>
                <p>Приложение для управления бюджетом</p>
                <div className="header__buttons-div">
                    {/* Ссылка на главную страницу */}
                    <Link to="/" className="header__button">Главная</Link>
                    {/* Условный рендеринг кнопок в зависимости от авторизации */}
                    {token ? (
                        <>
                            {/* Ссылка на профиль для авторизованных пользователей */}
                            <Link to="/profile" className="header__button">Профиль</Link>
                            {/* Кнопка выхода */}
                            <button onClick={handleLogout} className="header__button">Выход</button>
                        </>
                    ) : (
                        <>
                            {/* Ссылки для неавторизованных пользователей */}
                            <Link to="/login" className="header__button">Вход</Link>
                            <Link to="/registration" className="header__button">Регистрация</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;