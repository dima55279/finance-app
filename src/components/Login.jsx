import React from 'react';
import Header from './Header';
import Footer from './Footer';

function Login() {

    return (
        <>
        <Header />
        <div className="login">
            <h1 className="login__heading">Вход в профиль</h1>
            <form className="login__form">
                <label>
                    Электронная почта:
                    <input type="email" name="email" className="login__form__input"/>
                </label>
                <label>
                    Пароль:
                    <input type="password" name="password" className="login__form__input"/>
                </label>
                <input type="submit" value="Войти" className="login__form__submit"/>
            </form>
        </div>
        <Footer />
        </>
    );
}

export default Login;