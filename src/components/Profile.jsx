import React from 'react';
import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import AddCategoryPopup from './AddCategoryPopup';
import icon from '../images/userIcon.png'

function Profile() {

    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);

    function handleAddCategoryPopupClick() {
        setIsAddCategoryPopupOpen(true);
    }

    function closeAddCategoryPopup() {
        setIsAddCategoryPopupOpen(false);
    }

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
            <div>
                <p>Категории доходов и расходов:</p>
                <div className="profile__add-category">
                    <p>Добавить категорию</p>
                    <button className="profile__add-category__button" type="button" aria-label="открыть" onClick={handleAddCategoryPopupClick}></button>
                </div>
                <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup}/>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Profile;