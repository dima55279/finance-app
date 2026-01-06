import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/api/usersApi';
import { categoriesApi } from '../slices/api/categoriesApi';
import { operationsApi } from '../slices/api/operationsApi';
import logo from '../images/logo.png';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutMutation] = useLogoutMutation();

    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');

    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
            
            dispatch(categoriesApi.util.resetApiState());
            dispatch(operationsApi.util.resetApiState());
            dispatch(categoriesApi.util.invalidateTags(['Categories']));
            dispatch(operationsApi.util.invalidateTags(['Operations']));
            
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            dispatch(categoriesApi.util.resetApiState());
            dispatch(operationsApi.util.resetApiState());
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
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
                    {token ? (
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