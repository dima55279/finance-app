import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
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

    const [addOperation] = useAddOperationMutation();

    const { data: categoriesData, isLoading } = useGetCategoriesByUserQuery(userId);

    const userCategories = categoriesData || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOperationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveOperation = async () => {
        if (!operationData.name.trim() || !operationData.amount || !operationData.date) {
            alert('Заполните все обязательные поля');
            return;
        }

        if (!operationData.categoryId && userCategories.length > 0) {
            alert('Выберите категорию');
            return;
        }

        const newOperation = {
            name: operationData.name,
            date: operationData.date,
            amount: parseFloat(operationData.amount),
            categoryId: operationData.categoryId,
            author: userId,
        };

        try {
            await addOperation(newOperation).unwrap();
            
            setOperationData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                categoryId: userCategories.length > 0 ? userCategories[0].id : ''
            });
            
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении операции:', error);
            alert('Не удалось добавить операцию');
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

    if (isLoading) {
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
                            onChange={handleInputChange} placeholder="Например: Зарплата"/>
                    </label>
                    <label>
                        Дата совершения:
                        <input type="date" name="date" className="add-operation-popup__input-operation" value={operationData.date} onChange={handleInputChange}/>
                    </label>
                    <label>
                        Сумма:
                        <input type="number" name="amount" className="add-operation-popup__input-operation" value={operationData.amount} onChange={handleInputChange}/>
                    </label>
                    <label>
                        Категория:
                        {userCategories.length > 0 ? (
                            <select name="categoryId" className="add-operation-popup__input-operation" value={operationData.categoryId} onChange={handleInputChange}>
                                <option value="">Выберите категорию</option>
                                {userCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
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
                onClick={handleSaveOperation} disabled={userCategories.length === 0}>Сохранить</button>
            </div>
        </div>
    );
};

export default AddOperationPopup;