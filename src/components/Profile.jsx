import React from 'react';
import Header from './Header';
import Footer from './Footer';
import icon from '../images/userIcon.png'

function Profile() {

    return (
        <>
        <Header />
        <div className="profile">
        <h1>Профиль пользователя</h1>
            <div>
                <p>Аватарка:</p>
                <img className="profile__icon" src={icon} alt="аватарка" />
            </div>
            <p>Имя:</p>
            <p>Фамилия:</p>
            <p>Лимит бюджета:</p>
            <p>Категории расходов:</p>
        </div>
        <Footer />
        </>
    );
}

export default Profile;