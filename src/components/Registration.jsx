import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Registration() {

    return (
        <>
        <Header />
        <div className="registration">
            <h1 className="registration__heading">Регистрация</h1>
            <form className="registration__form">
                <label>
                    Имя:
                    <input type="text" name="name" className="registration__form__input" />
                </label>
                <label>
                    Фамилия:
                    <input type="text" name="surname" className="registration__form__input" />
                </label>
                <label>
                    Электронная почта:
                    <input type="email" name="email" className="registration__form__input" />
                </label>
                <label>
                    Пароль:
                    <input type="password" name="password" className="registration__form__input" />
                </label>
                <label>
                    Повторите пароль:
                    <input type="password" name="password" className="registration__form__input" />
                </label>
                <input type="submit" value="Зарегистрироваться" className="registration__form__submit" />
            </form>
            <div className="registration__question-block">
                <p>Уже зарегистрированы?</p>
                <Link to="/login" className="registration__question-btn">Войти в профиль</Link>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Registration;