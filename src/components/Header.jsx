import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo.png';

function Header() {
    return (
        <header className="header">
            <img className="header__logo" src={logo} alt="логотип" />
            <div>
                <p>Приложение для управления бюджетом</p>
                <div className="header__buttons-div">
                    <Link to="/" className="header__button">Главная</Link>
                    <Link to="/login" className="header__button">Вход</Link>
                    <Link to="/registration" className="header__button">Регистрация</Link>
                </div>
            </div>
        </header>
    );
}

export default Header;