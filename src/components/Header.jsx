import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { actions as authActions } from '../slices/authSlice';
import logo from '../images/logo.png';

function Header() {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const currentUser = useSelector(state => state.auth.currentUser);

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    return (
        <header className="header">
            <img className="header__logo" src={logo} alt="логотип" />
            <div>
                <p>Приложение для управления бюджетом</p>
                <div className="header__buttons-div">
                    <Link to="/" className="header__button">Главная</Link>
                    {isAuthenticated ? (
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