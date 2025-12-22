import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import UpdateAvatarPopup from './UpdateAvatarPopup';
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
    
    const [isUpdateAvatarPopupOpen, setIsUpdateAvatarPopupOpen] = useState(false);
    const [isBudgetLimitPopupOpen, setIsBudgetLimitPopupOpen] = useState(false);
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
    const [isAddOperationPopupOpen, setIsAddOperationPopupOpen] = useState(false);

    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
    const currentUser = useSelector(state => state.auth.currentUser);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    const allCategories = useSelector(categoriesSelectors.selectAll);
    const allOperations = useSelector(operationsSelectors.selectAll);

    const userCategories = useMemo(() => {
        return allCategories.filter(
            category => category.author === currentUser?.id
        );
    }, [allCategories, currentUser?.id]);

    const userOperations = useMemo(() => {
        return allOperations
            .filter(operation => operation.author === currentUser?.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allOperations, currentUser?.id]);

    const filteredOperations = useMemo(() => {
        let filtered = userOperations;

        if (selectedCategoryFilter !== 'all') {
            filtered = filtered.filter(operation => 
                operation.categoryId === selectedCategoryFilter
            );
        }

        const now = new Date();
        switch (selectedDateFilter) {
            case 'week': {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= weekAgo
                );
                break;
            }
            case 'month': {
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= monthAgo
                );
                break;
            }
            case 'year': {
                const yearAgo = new Date(now);
                yearAgo.setFullYear(now.getFullYear() - 1);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= yearAgo
                );
                break;
            }
            case 'selected_year': {
                filtered = filtered.filter(operation => 
                    new Date(operation.date).getFullYear() === selectedYear
                );
                break;
            }
            case 'selected_month': {
                filtered = filtered.filter(operation => {
                    const opDate = new Date(operation.date);
                    return opDate.getFullYear() === selectedYear && 
                           opDate.getMonth() + 1 === selectedMonth;
                });
                break;
            }
            case 'all':
            default:
                break;
        }

        return filtered;
    }, [userOperations, selectedCategoryFilter, selectedDateFilter, selectedYear, selectedMonth]);

    const availableYears = useMemo(() => {
        const years = userOperations.map(op => new Date(op.date).getFullYear());
        const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
        return uniqueYears;
    }, [userOperations]);

    const { totalIncome, totalExpense } = useMemo(() => {
        return filteredOperations.reduce((acc, operation) => {
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
    }, [filteredOperations, userCategories]);

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

    const handleCategoryFilterChange = (e) => {
        setSelectedCategoryFilter(e.target.value);
    };

    const handleDateFilterChange = (e) => {
        setSelectedDateFilter(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
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

    function handleUpdateAvatarPopupClick() {
        setIsUpdateAvatarPopupOpen(true);
    }

    function closeUpdateAvatarPopup() {
        setIsUpdateAvatarPopupOpen(false);
    }

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
            <div>
                <h1 className="profile__headers">Профиль пользователя</h1>
                <p>Фотография профиля:</p>
                <img className="profile__icon" src={currentUser?.avatar || icon} alt="аватар" onError={(e) => { e.target.src = icon; }}/>
                <div className="profile__add-block">
                    <p>Изменить фотографию профиля</p>
                    <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleUpdateAvatarPopupClick}></button>
                </div>
                <UpdateAvatarPopup isOpen={isUpdateAvatarPopupOpen} onClose={closeUpdateAvatarPopup} userId={currentUser.id}/>
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
                <h1 className="profile__headers">Категории</h1>
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
                <h1 className="profile__headers">Операции</h1>

                <div>
                    <h3>Фильтры:</h3>
                    <div className="profile__select-div">
                        <label htmlFor="category-filter">Категория: </label>
                        <select id="category-filter" value={selectedCategoryFilter} onChange={handleCategoryFilterChange} className="profile__option">
                            <option value="all" className="profile__option">Все категории</option>
                            {userCategories.map(category => (
                                <option key={category.id} value={category.id} className="profile__option">
                                    {category.name} ({category.type === 'income' ? 'доход' : 'расход'})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="profile__select-div">
                        <label htmlFor="date-filter">Период: </label>
                        <select id="date-filter" value={selectedDateFilter} onChange={handleDateFilterChange} className="profile__option">
                            <option value="all" className="profile__option">Все время</option>
                            <option value="week" className="profile__option">Последняя неделя</option>
                            <option value="month" className="profile__option">Последний месяц</option>
                            <option value="year" className="profile__option">Последний год</option>
                            <option value="selected_year" className="profile__option">Выбранный год</option>
                            <option value="selected_month" className="profile__option">Выбранный месяц</option>
                        </select>
                        
                        {selectedDateFilter === 'selected_year' && (
                            <select value={selectedYear} onChange={handleYearChange} className="profile__option">
                                {availableYears.map(year => (
                                    <option key={year} value={year} className="profile__option">{year} год</option>
                                ))}
                            </select>
                        )}
                        
                        {selectedDateFilter === 'selected_month' && (
                            <>
                                <select value={selectedYear} onChange={handleYearChange} className="profile__option">
                                    {availableYears.map(year => (
                                        <option key={year} value={year} className="profile__option">{year} год</option>
                                    ))}
                                </select>
                                <select value={selectedMonth} onChange={handleMonthChange} className="profile__option">
                                    <option value="1" className="profile__option">Январь</option>
                                    <option value="2" className="profile__option">Февраль</option>
                                    <option value="3" className="profile__option">Март</option>
                                    <option value="4" className="profile__option">Апрель</option>
                                    <option value="5" className="profile__option">Май</option>
                                    <option value="6" className="profile__option">Июнь</option>
                                    <option value="7" className="profile__option">Июль</option>
                                    <option value="8" className="profile__option">Август</option>
                                    <option value="9" className="profile__option">Сентябрь</option>
                                    <option value="10" className="profile__option">Октябрь</option>
                                    <option value="11" className="profile__option">Ноябрь</option>
                                    <option value="12" className="profile__option">Декабрь</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>
                
                <div>
                    <h3>Статистика операций:</h3>
                    <div>
                        <div>
                            <span>Всего операций: {filteredOperations.length}</span>
                        </div>
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
                    
                <h3>Операции:</h3>
                {filteredOperations.length > 0 ? (
                    <div>
                        {filteredOperations.map(operation => {
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
                    <p>Нет операций, соответствующих выбранным фильтрам.</p>
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