import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AddCategoryPopup from './AddCategoryPopup';
import { actions as authActions } from '../slices/authSlice';
import icon from '../images/userIcon.png'

function Profile() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    
    const currentUser = useSelector(state => state.auth.currentUser);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    if (!currentUser) {
        return <div>Загрузка...</div>;
    }

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
            <p>Имя: {currentUser.name} </p>
            <p>Фамилия: {currentUser.surname} </p>
            <p>Лимит бюджета: {currentUser.budgetLimit || 0} рублей</p>
            <div>
                <p>Категории доходов и расходов:</p>
                <div className="profile__add-category">
                    <p>Добавить категорию</p>
                    <button className="profile__add-category__button" type="button" aria-label="открыть" onClick={handleAddCategoryPopupClick}></button>
                </div>
                <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup} userId={currentUser.id}/>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Profile;