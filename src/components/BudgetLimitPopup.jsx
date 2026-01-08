/* 
Компонент BudgetLimitPopup. Используется для отображения попапа для установки/изменения лимита бюджета пользователя. 
Данный компонент содержит форму для ввода лимита бюджета. 
*/
import React from 'react';
import { useState, useEffect } from 'react';
import { useUpdateUserBudgetMutation } from '../slices/api/usersApi';

// Компонент для установки/изменения лимита бюджета пользователя
function BudgetLimitPopup (props) {
    // Получение пропсов: состояние открытия компонента и функция закрытия
    const { isOpen, onClose } = props;

    // RTK Query мутация для обновления бюджета пользователя
    const [updateUserBudget] = useUpdateUserBudgetMutation();
    
    // Состояние для хранения значения бюджета
    const [budget, setBudget] = useState('');
    // Состояние для хранения ошибок валидации или запроса
    const [error, setError] = useState('');

    // Эффект для сброса состояния формы при открытии компонента
    useEffect(() => {
        if (isOpen) {
            setBudget('');
            setError('');
        }
    }, [isOpen]);
    
    // Функция для сохранения нового лимита бюджета
    const handleSave = async () => {
        // Преобразование введенного значения в число
        const budgetValue = parseFloat(budget);
        
        // Валидация: проверка, что введено корректное число
        if (isNaN(budgetValue)) {
            setError('Пожалуйста, введите корректное число');
            return;
        }
        
        // Валидация: бюджет не может быть отрицательным
        if (budgetValue < 0) {
            setError('Бюджет не может быть отрицательным');
            return;
        }
        
        // Валидация: проверка на слишком большое значение
        if (budgetValue > 1000000000) {
            setError('Бюджет слишком большой');
            return;
        }

        try {
            // Получение ID пользователя из localStorage
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('Пользователь не найден');
                return;
            }
            
            // Вызов мутации для обновления бюджета пользователя
            await updateUserBudget({
                userId: parseInt(userId),
                budgetLimit: budgetValue
            }).unwrap();

            // Закрытие компонента после успешного обновления
            onClose();
        } catch (error) {
            // Обработка ошибок при обновлении бюджета
            console.error('Ошибка при обновлении бюджета:', error);
            const errorDetail = error.data?.detail || error.data?.message || 'Неизвестная ошибка';
            setError(`Не удалось обновить бюджет: ${errorDetail}`);
        }
    };
    
    return (
        <div className={`budget-popup ${isOpen ? 'budget-popup__open' : ''}`}>
            <div>
                <button className="budget-popup__close-btn" type="button" aria-label="закрыть" onClick={onClose}></button>
                <div className="budget-popup__input-div">
                    <label>
                        Введите новый лимит бюджета на месяц:
                        <input type="number" name="budget" className="budget-popup__input-budget" value={budget}
                            onChange={(e) => setBudget(e.target.value)} placeholder="50000" min="0" step="100" autoFocus/>
                    </label>
                </div>
                <button type="button" aria-label="сохранить" className="budget-popup__save-budget-btn" onClick={handleSave}>Сохранить</button>
            </div>
        </div>
    );
};

export default BudgetLimitPopup;