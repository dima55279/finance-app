import React from 'react';
import { useState, useEffect } from 'react';
import { useUpdateUserBudgetMutation } from '../slices/api/usersApi';

function BudgetLimitPopup (props) {
    const { isOpen, onClose } = props;

    const [updateUserBudget] = useUpdateUserBudgetMutation();
    
    const [budget, setBudget] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setBudget('');
            setError('');
        }
    }, [isOpen]);
    
    const handleSave = async () => {
        const budgetValue = parseFloat(budget);
        
        if (isNaN(budgetValue)) {
            setError('Пожалуйста, введите корректное число');
            return;
        }
        
        if (budgetValue < 0) {
            setError('Бюджет не может быть отрицательным');
            return;
        }
        
        if (budgetValue > 1000000000) {
            setError('Бюджет слишком большой');
            return;
        }

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('Пользователь не найден');
                return;
            }
            
            await updateUserBudget({
                userId: parseInt(userId),
                budgetLimit: budgetValue
            }).unwrap();

            onClose();
        } catch (error) {
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