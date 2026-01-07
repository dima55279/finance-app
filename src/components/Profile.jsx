import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import UpdateAvatarPopup from './UpdateAvatarPopup';
import BudgetLimitPopup from './BudgetLimitPopup';
import AddCategoryPopup from './AddCategoryPopup';
import AddOperationPopup from './AddOperationPopup';
import { useLogoutMutation, useGetCurrentUserQuery } from '../slices/api/usersApi';
import { useGetCategoriesByUserQuery, useRemoveCategoryMutation } from '../slices/api/categoriesApi';
import { useGetOperationsByUserQuery, useRemoveOperationMutation } from '../slices/api/operationsApi';
import icon from '../images/userIcon.png'

function Profile() {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');
  
  const [isUpdateAvatarPopupOpen, setIsUpdateAvatarPopupOpen] = useState(false);
  const [isBudgetLimitPopupOpen, setIsBudgetLimitPopupOpen] = useState(false);
  const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false);
  const [isAddOperationPopupOpen, setIsAddOperationPopupOpen] = useState(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [budgetWarning, setBudgetWarning] = useState(null);
  
  const { data: currentUser, isLoading: userLoading, error: userError } = useGetCurrentUserQuery(undefined, {
    skip: !token
  });
  const [logoutMutation, { isLoading: logoutLoading }] = useLogoutMutation();

  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetCategoriesByUserQuery(undefined, {
    skip: !token
  });

  const [removeCategory, { isLoading: removeCategoryLoading }] = useRemoveCategoryMutation();

  const { data: operationsData = [], isLoading: operationsLoading } = useGetOperationsByUserQuery(undefined, {
    skip: !token
  });
  const [removeOperation, { isLoading: removeOperationLoading }] = useRemoveOperationMutation();

  useEffect(() => {
    if (userError && userError.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      navigate('/login');
    }
  }, [userError, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, userLoading, navigate]);

  const userCategories = useMemo(() => {
    return [...categoriesData];
  }, [categoriesData]);

  const userOperations = useMemo(() => {
    return [...operationsData].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [operationsData]);

  const filteredOperations = useMemo(() => {
    let filtered = userOperations;

    if (selectedCategoryFilter !== 'all') {
        const categoryId = parseInt(selectedCategoryFilter);
        filtered = filtered.filter(operation => {
            const opCategoryId = operation.categoryId || operation.category_id;
            return opCategoryId === categoryId;
        });
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
    const uniqueYears = [...new Set(years)];
    return [...uniqueYears].sort((a, b) => b - a);
  }, [userOperations]);

  const { totalIncome, totalExpense, incomeCount, expenseCount, balance } = useMemo(() => {
    const stats = filteredOperations.reduce((acc, operation) => {
      const categoryId = operation.categoryId || operation.category_id;
      
      const category = userCategories.find(cat => cat.id === categoryId);
      
      if (category) {
        if (category.category_type === 'income') {
          acc.totalIncome += Math.abs(operation.amount);
          acc.incomeCount += 1;
          acc.balance += Math.abs(operation.amount);
        } else if (category.category_type === 'expense') {
          acc.totalExpense += Math.abs(operation.amount);
          acc.expenseCount += 1;
          acc.balance -= Math.abs(operation.amount);
        }
      } else {
        console.log('Category not found for operation:', operation);
      }
      
      return acc;
    }, { 
      totalIncome: 0, 
      totalExpense: 0, 
      incomeCount: 0, 
      expenseCount: 0,
      balance: 0 
    });
    
    return stats;
  }, [filteredOperations, userCategories]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    return userOperations.reduce((total, operation) => {
      const operationDate = new Date(operation.date);
      const operationYear = operationDate.getFullYear();
      const operationMonth = operationDate.getMonth() + 1;
      
      if (operationYear === currentYear && operationMonth === currentMonth) {
        const categoryId = operation.categoryId || operation.category_id;
        const category = userCategories.find(cat => cat.id === categoryId);
        
        if (category && category.category_type === 'expense') {
          return total + Math.abs(operation.amount);
        }
      }
      return total;
    }, 0);
  }, [userOperations, userCategories]);

  useEffect(() => {
    if (!currentUser?.budgetLimit || currentUser.budgetLimit <= 0) {
      setBudgetWarning(null);
      return;
    }
    
    const budgetLimit = currentUser.budgetLimit;
    const warningThreshold = 0.8;
    
    if (currentMonthExpenses > budgetLimit) {
      setBudgetWarning({
        type: 'exceeded',
        message: `Вы превысили лимит бюджета! Расходы: ${formatAmount(currentMonthExpenses)} руб. (Лимит: ${formatAmount(budgetLimit)} руб.)`
      });
    } else if (currentMonthExpenses >= budgetLimit * warningThreshold) {
      setBudgetWarning({
        type: 'warning',
        message: `Вы приближаетесь к лимиту бюджета! Расходы: ${formatAmount(currentMonthExpenses)} руб. (${((currentMonthExpenses / budgetLimit) * 100).toFixed(1)}% от лимита ${formatAmount(budgetLimit)} руб.)`
      });
    } else {
      setBudgetWarning(null);
    }
  }, [currentMonthExpenses, currentUser?.budgetLimit]);

  const isLoading = userLoading || categoriesLoading || operationsLoading;

  if (isLoading) {
    return (
        <>
            <Header />
            <div className="profile">
                <h1 className="profile__headers">Вход в профиль...</h1>
                <Loader />
            </div>
            <Footer />
        </>
    );
  }

  if (!currentUser) {
    return (
        <>
            <Header />
            <div className="profile">
                <h1 className="profile__headers">Не удалось загрузить профиль.</h1>
                <button onClick={() => window.location.reload()}>Повторить</button>
            </div>
            <Footer />
        </>
    );
  }

  const getCategoryName = (categoryId) => {
      if (!categoryId) return 'Без категории';
      const category = userCategories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Без категории';
  };

  const getCategoryColor = (categoryId) => {
      if (!categoryId) return '#cccccc';
      const category = userCategories.find(cat => cat.id === categoryId);
      return category ? category.color : '#cccccc';
  };

  const getCategoryType = (categoryId) => {
      if (!categoryId) return 'unknown';
      const category = userCategories.find(cat => cat.id === categoryId);
      return category ? category.category_type : 'unknown';
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

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      navigate('/');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await removeCategory(categoryId).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        alert('Не удалось удалить категорию');
      }
    }
  };

  const handleDeleteOperation = async (operationId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        await removeOperation(operationId).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении операции:', error);
        alert('Не удалось удалить операцию');
      }
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

  return (
    <>
      <Header />
      <div className="profile">
        {(logoutLoading || removeCategoryLoading || removeOperationLoading) && <Loader />}
        
        <div>
          <h1 className="profile__headers">Профиль пользователя</h1>
          <p>Фотография профиля:</p>
          <img className="profile__icon" src={currentUser?.avatar || icon} alt="аватар" onError={(e) => { e.target.src = icon; }}/>
          <div className="profile__add-block">
            <p>Изменить фотографию профиля</p>
            <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleUpdateAvatarPopupClick}></button>
          </div>
          <UpdateAvatarPopup isOpen={isUpdateAvatarPopupOpen} onClose={closeUpdateAvatarPopup}/>
        </div>
        <p>Имя: {currentUser.name} </p>
        <p>Фамилия: {currentUser.surname} </p>
        <div>
          <p>Лимит бюджета на месяц: {currentUser.budgetLimit || 0} руб.</p>
          {budgetWarning && (
            <div className={`profile__budget-warning profile__budget-warning__${budgetWarning.type}`}>
              <p>{budgetWarning.message}</p>
              <p>Текущие расходы за месяц: {formatAmount(currentMonthExpenses)} руб.</p>
            </div>
          )}
          <div className="profile__add-block">
            <p>Изменить бюджет</p>
            <button className="profile__change-btn" type="button" aria-label="открыть" onClick={handleBudgetLimitPopupClick}></button>
          </div>
          <BudgetLimitPopup isOpen={isBudgetLimitPopupOpen} onClose={closeBudgetLimitPopup}/>
        </div>
        <div>
          <h1 className="profile__headers">Категории</h1>
          <p>Категории доходов и расходов:</p>
          <div>
            {userCategories.length > 0 ? (
              <div>
                <h3>Доходы:</h3>
                {userCategories
                  .filter(category => category.category_type === 'income')
                  .map(category => (
                    <div key={category.id} className="profile__category">
                      <span>{category.name}</span>
                      <span style={{ backgroundColor: category.color, color: category.color, marginLeft: '10px',
                        borderColor: category.color, width: '20px', height: '20px', borderRadius: '50%' }}>00</span>
                      <button type="button" className="profile__delete-btn" onClick={() => handleDeleteCategory(category.id)} 
                        aria-label="удалить категорию" disabled={removeCategoryLoading}></button>
                    </div>
                  ))}
                
                <h3>Расходы:</h3>
                {userCategories
                  .filter(category => category.category_type === 'expense')
                  .map(category => (
                    <div key={category.id} className="profile__category">
                      <span>{category.name}</span>
                      <span style={{ backgroundColor: category.color, color: category.color, marginLeft: '10px',
                        borderColor: category.color, width: '20px', height: '20px', borderRadius: '50%' }}>00</span>
                      <button type="button" className="profile__delete-btn" onClick={() => handleDeleteCategory(category.id)} 
                        aria-label="удалить категорию" disabled={removeCategoryLoading}></button>
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
          <AddCategoryPopup isOpen={isAddCategoryPopupOpen} onClose={closeAddCategoryPopup}/>
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
                    {category.name} ({category.category_type === 'income' ? 'доход' : 'расход'})
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
                <span>Операций доходов: {incomeCount}</span>
              </div>
              <div>
                <span>Операций расходов: {expenseCount}</span>
              </div>
              <div>
                <span>Сумма доходов: {formatAmount(totalIncome)} руб.</span>
              </div>
              <div>
                <span>Сумма расходов: {formatAmount(totalExpense)} руб.</span>
              </div>
              <div>
                <span>Баланс: {formatAmount(balance)} руб.</span>
              </div>
            </div>
        </div>
              
          <h3>Операции:</h3>
          {filteredOperations.length > 0 ? (
              <div>
                  {filteredOperations.map(operation => {
                      const categoryId = operation.categoryId || operation.category_id;
                      const category = userCategories.find(cat => cat.id === categoryId);
                      
                      const categoryName = category ? category.name : 'Без категории';
                      const categoryColor = category ? category.color : '#cccccc';
                      const isIncome = category ? category.category_type === 'income' : false;
                      
                      return (
                          <div key={operation.id}>
                              <div>
                                  <div className="profile__operation">
                                      <span>{operation.name}, {formatDate(operation.date)}</span>
                                  </div>
                                  <div className="profile__operation">
                                      <span style={{ color: categoryColor }}>
                                          {categoryName}
                                      </span>
                                      <span>
                                          {isIncome ? ' +' : ' -'}{formatAmount(operation.amount)} руб.
                                      </span>
                                      <button type="button" className="profile__delete-btn" onClick={() => handleDeleteOperation(operation.id)} 
                                        aria-label="удалить операцию" disabled={removeOperationLoading}></button>
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
        <AddOperationPopup isOpen={isAddOperationPopupOpen} onClose={closeAddOperationPopup}/>
      </div>
      <Footer />
    </>
  );
}

export default Profile;