import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AddCategoryPopup from './AddCategoryPopup';
import BudgetLimitPopup from './BudgetLimitPopup';
import { actions as authActions } from '../slices/authSlice';
import icon from '../images/userIcon.png'

function Profile() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [isBudgetLimitPopupOpen, setIsBudgetLimitPopupOpen] = useState(false);
    
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

    function handleBudgetLimitPopupClick() {
        setIsBudgetLimitPopupOpen(true);
    }

    function closeBudgetLimitPopup() {
        setIsBudgetLimitPopupOpen(false);
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
            <div>
                <p>Лимит бюджета на месяц: {currentUser.budgetLimit || 0} руб.</p>
                <div className="profile__add-block">
                    <p>Изменить бюджет</p>
                    <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleBudgetLimitPopupClick}></button>
                </div>
                <BudgetLimitPopup isOpen={isBudgetLimitPopupOpen} onClose={closeBudgetLimitPopup} userId={currentUser.id}/>
            </div>
            <div>
                <p>Категории доходов и расходов:</p>
                <div className="profile__add-block">
                    <p>Изменить список категорий</p>
                    <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleAddCategoryPopupClick}></button>
                </div>
                <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup} userId={currentUser.id}/>
            </div>
            <div>
                <p>Последние операции:</p>
                <div className="profile__add-block">
                    <p>Изменить добавленные операции</p>
                    <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleAddCategoryPopupClick}></button>
                </div>
                <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup} userId={currentUser.id}/>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Profile;