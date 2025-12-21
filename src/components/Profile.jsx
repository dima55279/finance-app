import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BudgetLimitPopup from './BudgetLimitPopup';
import AddCategoryPopup from './AddCategoryPopup';
import AddOperationPopup from './AddOperationPopup';
import { actions as authActions } from '../slices/authSlice';
import { actions as categoriesActions, selectors as categoriesSelectors } from '../slices/categoriesSlice';
import { actions as operationsActions, selectors as operationsSelectors } from '../slices/operationsSlice';
import icon from '../images/userIcon.png'

function Profile() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isBudgetLimitPopupOpen, setIsBudgetLimitPopupOpen] = useState(false);
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [isAddOperationPopupOpen, setIsAddOperationPopupOpen] = useState(false);
    
    const currentUser = useSelector(state => state.auth.currentUser);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    const allCategories = useSelector(categoriesSelectors.selectAll);

    const userCategories = allCategories.filter(
        category => category.author === currentUser?.id
    );

    const allOperations = useSelector(operationsSelectors.selectAll);

    const userOperations = allOperations
        .filter(operation => operation.author === currentUser?.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    const { totalIncome, totalExpense } = userOperations.reduce((acc, operation) => {
        const category = userCategories.find(cat => cat.id === operation.categoryId);
        if (category) {
            if (category.type === 'income') {
                acc.totalIncome += Math.abs(operation.amount);
            } else if (category.type === 'expense') {
                acc.totalExpense += Math.abs(operation.amount);
            }
        }
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    const totalBalance = totalIncome - totalExpense;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate('/');
    };

    const handleDeleteCategory = (categoryId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            dispatch(categoriesActions.removeCategory({ id: categoryId }));
        }
    };

    const handleDeleteOperation = (operationId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту операцию?')) {
            dispatch(operationsActions.removeOperation(operationId));
        }
    };

    if (!currentUser) {
        return <div>Загрузка...</div>;
    }

    const getCategoryName = (categoryId) => {
        const category = userCategories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Без категории';
    };

    const getCategoryColor = (categoryId) => {
        const category = userCategories.find(cat => cat.id === categoryId);
        return category ? category.color : '#cccccc';
    };

    const getCategoryType = (categoryId) => {
        const category = userCategories.find(cat => cat.id === categoryId);
        return category ? category.type : 'unknown';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
    };

    function handleBudgetLimitPopupClick() {
        setIsBudgetLimitPopupOpen(true);
    }

    function closeBudgetLimitPopup() {
        setIsBudgetLimitPopupOpen(false);
    }

    function handleAddCategoryPopupClick() {
        setIsAddCategoryPopupOpen(true);
    }

    function closeAddCategoryPopup() {
        setIsAddCategoryPopupOpen(false);
    }

    function handleAddOperationPopupClick() {
        setIsAddOperationPopupOpen(true);
    }

    function closeAddOperationPopup() {
        setIsAddOperationPopupOpen(false);
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
                <div>
                    {userCategories.length > 0 ? (
                        <div>
                            <h3>Доходы:</h3>
                            {userCategories
                                .filter(category => category.type === 'income')
                                .map(category => (
                                    <div key={category.id} className="profile__category">
                                        <span>{category.name}</span>
                                        <span style={{ backgroundColor: category.color, color: category.color, marginLeft: '10px',
                                            borderColor: category.color, width: '20px', height: '20px', borderRadius: '50%' }}>00</span>
                                        <button type="button" className="profile__delete-btn" 
                                        onClick={() => handleDeleteCategory(category.id)} aria-label="удалить категорию"></button>
                                    </div>
                                ))}
                            
                            <h3>Расходы:</h3>
                            {userCategories
                                .filter(category => category.type === 'expense')
                                .map(category => (
                                    <div key={category.id} className="profile__category">
                                        <span>{category.name}</span>
                                        <span style={{ backgroundColor: category.color, color: category.color, marginLeft: '10px',
                                            borderColor: category.color, width: '20px', height: '20px', borderRadius: '50%' }}>00</span>
                                        <button type="button" className="profile__delete-btn" 
                                        onClick={() => handleDeleteCategory(category.id)} aria-label="удалить категорию"></button>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p>Нет добавленных категорий.</p>
                    )}
                </div>
            </div>
            <div>
                <div className="profile__add-block">
                    <p>Добавить категории</p>
                    <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleAddCategoryPopupClick}></button>
                </div>
                <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup} userId={currentUser.id}/>
            </div>
            <div>
                <div>
                    <h3>Статистика операций:</h3>
                    <div>
                        <div>
                            <span>Всего доходов: {formatAmount(totalIncome)} руб.</span>
                        </div>
                        <div>
                            <span>Всего расходов: {formatAmount(totalExpense)} руб.</span>
                        </div>
                        <div>
                            <span>Баланс: {formatAmount(totalBalance)} руб.</span>
                        </div>
                    </div>
                </div>
                    
                <h3>Последние операции:</h3>
                {userOperations.length > 0 ? (
                    <div>
                        {userOperations.map(operation => {
                            const operationType = getCategoryType(operation.categoryId);
                            const isIncome = operationType === 'income';
                            return (
                                <div key={operation.id}>
                                    <div>
                                        <div className="profile__operation">
                                            <span>{operation.name}, {formatDate(operation.date)}</span>
                                        </div>
                                        <div className="profile__operation">
                                            <span style={{ color: getCategoryColor(operation.categoryId) }}>
                                                {getCategoryName(operation.categoryId)}
                                            </span>
                                            <span>
                                                {isIncome ? ' +' : ' -'}{formatAmount(operation.amount)} руб.
                                            </span>
                                            <button type="button" className="profile__delete-btn" 
                                            onClick={() => handleDeleteOperation(operation.id)} aria-label="удалить операцию"></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>Нет добавленных операций.</p>
                )}
                    
                <div>
                    <div className="profile__add-block">
                        <p>Добавить операцию</p>
                        <button className="profile__change-btn" type="button" aria-label="открыть" 
                        onClick={handleAddOperationPopupClick} disabled={userCategories.length === 0}></button>
                    </div>
                </div>
            </div>
            <AddOperationPopup isOpen={isAddOperationPopupOpen} onClose={closeAddOperationPopup} userId={currentUser.id}/>
        </div>
        <Footer />
        </>
    );
}

export default Profile;