import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation, useGetCurrentUserQuery } from '../slices/api/usersApi';
import logo from '../images/logo.png';

function Header() {
    const navigate = useNavigate();
    const [logoutMutation] = useLogoutMutation();
    const { data: currentUser, isLoading } = useGetCurrentUserQuery();

    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            navigate('/');
        }
    };

    return (
        <header className="header">
            <img className="header__logo" src={logo} alt="логотип" />
            <div>
                <p>Приложение для управления бюджетом</p>
                <div className="header__buttons-div">
                    <Link to="/" className="header__button">Главная</Link>
                    {!isLoading && currentUser ? (
                        <>
                        <Link to="/profile" className="header__button">Профиль</Link>
                        <button onClick={handleLogout} className="header__button">Выход</button>
                        </>
                    ) : (
                        <>
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