import React from 'react';
import { useState, useEffect } from 'react';
import { useAddOperationMutation } from '../slices/api/operationsApi';
import { useGetCategoriesByUserQuery } from '../slices/api/categoriesApi'; 

function AddOperationPopup (props) {
    const { isOpen, onClose, userId } = props;

    const [operationData, setOperationData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        categoryId: ''
    });

    const [addOperation, { isLoading: isAdding }] = useAddOperationMutation();

    const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesByUserQuery(userId);

    const userCategories = categoriesData || [];

    useEffect(() => {
        if (userCategories.length > 0 && !operationData.categoryId) {
            setOperationData(prev => ({
                ...prev,
                categoryId: userCategories[0].id
            }));
        }
    }, [userCategories, operationData.categoryId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOperationData(prev => ({
            ...prev,
            [name]: name === 'categoryId' ? parseInt(value) || '' : value
        }));
    };

    const handleSaveOperation = async () => {
        console.log('Данные для отправки:', operationData);
        console.log('Категории пользователя:', userCategories);

        if (!operationData.name.trim()) {
            alert('Введите название операции');
            return;
        }

        if (!operationData.amount || parseFloat(operationData.amount) <= 0) {
            alert('Введите корректную сумму');
            return;
        }

        if (!operationData.date) {
            alert('Выберите дату');
            return;
        }

        if (userCategories.length === 0) {
            alert('Сначала создайте категорию');
            return;
        }

        if (!operationData.categoryId) {
            alert('Выберите категорию');
            return;
        }

        const dateObj = new Date(operationData.date);
        const isoDate = dateObj.toISOString();

        const newOperation = {
            name: operationData.name,
            date: isoDate,
            amount: parseFloat(operationData.amount),
            categoryId: parseInt(operationData.categoryId),
            author: parseInt(userId),
        };

        console.log('Отправляемые данные:', newOperation);

        try {
            const result = await addOperation(newOperation).unwrap();
            console.log('Операция успешно создана:', result);

            setOperationData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                categoryId: userCategories.length > 0 ? userCategories[0].id : ''
            });
            
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении операции:', error);
            alert(`Не удалось добавить операцию: ${error.data?.detail || error.error || 'Неизвестная ошибка'}`);
        }
    };

    const handleClose = () => {
        setOperationData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            categoryId: userCategories.length > 0 ? userCategories[0].id : ''
        });
        onClose();
    };

    if (isCategoriesLoading) {
        return <div>Загрузка категорий...</div>;
    }

    return (
        <div className={`add-operation-popup ${isOpen ? 'add-operation-popup__open' : ''}`}>
            <div>
                <div className="add-operation-popup__header">
                    <button className="add-operation-popup__close-btn" type="button" aria-label="закрыть" onClick={handleClose}></button>
                    <p>Добавить операцию</p>
                </div>
                <div className="add-operation-popup__input-div">
                    <label>
                        Название:
                        <input type="text" name="name" className="add-operation-popup__input-operation" value={operationData.name} 
                        onChange={handleInputChange} placeholder="Например: Зарплата" required/>
                    </label>
                    <label>
                        Дата совершения:
                        <input type="date" name="date" className="add-operation-popup__input-operation" 
                        value={operationData.date} onChange={handleInputChange} required/>
                    </label>
                    <label>
                        Сумма:
                        <input type="number" name="amount" className="add-operation-popup__input-operation" 
                        value={operationData.amount} onChange={handleInputChange} step="0.01" min="0.01" required/>
                    </label>
                    <label>
                        Категория:
                        {userCategories.length > 0 ? (
                            <select name="categoryId" className="add-operation-popup__input-operation" value={operationData.categoryId} onChange={handleInputChange} required>
                                <option value="">Выберите категорию</option>
                                {userCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.category_type === 'income' ? 'доход' : 'расход'})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="add-operation-popup__no-categories">
                                <p>Нет доступных категорий. Сначала создайте категорию.</p>
                            </div>
                        )}
                    </label>
                </div>
                <button type="button" aria-label="сохранить" className="add-operation-popup__save-operation-btn" 
                    onClick={handleSaveOperation} disabled={userCategories.length === 0 || isAdding}>
                    {isAdding ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </div>
    );
};

export default AddOperationPopup;