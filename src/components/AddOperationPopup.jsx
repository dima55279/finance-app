/* 
Компонент AddOperationPopup. Используется для отображения попапа для добавления новой финансовой операции.
Данный компонент содержит форму для ввода названия операции, даты, суммы и выбора категории.
*/
import React from 'react';
import { useState, useEffect } from 'react';
import { useAddOperationMutation } from '../slices/api/operationsApi';
import { useGetCategoriesByUserQuery } from '../slices/api/categoriesApi'; 
import Loader from './Loader';

// Основной компонент попапа для добавления новой финансовой операции
function AddOperationPopup (props) {
    // Получение пропсов: состояние открытия компонента и функция закрытия
    const { isOpen, onClose } = props;

    // Состояние для хранения данных новой операции
    const [operationData, setOperationData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD, не учитывая часы, минуты и секунды
        amount: '',
        categoryId: ''
    });

    // RTK Query мутация для добавления операции с состоянием загрузки
    const [addOperation, { isLoading: isAdding }] = useAddOperationMutation();

    // Запрос на получение категорий текущего пользователя
    const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesByUserQuery();

    // Использование данных категорий или пустого массива по умолчанию
    const userCategories = categoriesData || [];

    // Эффект для установки первой доступной категории по умолчанию
    useEffect(() => {
        if (userCategories.length > 0 && !operationData.categoryId) {
            setOperationData(prev => ({
                ...prev,
                categoryId: userCategories[0].id
            }));
        }
    }, [userCategories, operationData.categoryId]);

    // Универсальный обработчик изменения полей формы
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOperationData(prev => ({
            ...prev,
            [name]: name === 'categoryId' ? parseInt(value) || '' : value
        }));
    };

    // Функция для сохранения новой операции
    const handleSaveOperation = async () => {
        // Валидация названия операции
        if (!operationData.name.trim()) {
            alert('Введите название операции');
            return;
        }

        // Валидация суммы операции
        if (!operationData.amount || parseFloat(operationData.amount) <= 0) {
            alert('Введите корректную сумму');
            return;
        }

        // Валидация даты операции
        if (!operationData.date) {
            alert('Выберите дату');
            return;
        }

        // Проверка наличия категорий у пользователя
        if (userCategories.length === 0) {
            alert('Сначала создайте категорию');
            return;
        }

        // Валидация выбранной категории
        if (!operationData.categoryId) {
            alert('Выберите категорию');
            return;
        }

        // Преобразование даты в ISO формат
        const dateObj = new Date(operationData.date);
        const isoDate = dateObj.toISOString();

        // Формирование объекта новой операции
        const newOperation = {
            name: operationData.name,
            date: isoDate,
            amount: parseFloat(operationData.amount),
            categoryId: parseInt(operationData.categoryId),
        };

        try {
            // Отправка запроса на добавление операции
            await addOperation(newOperation).unwrap();

            // Сброс формы после успешного добавления
            setOperationData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                categoryId: userCategories.length > 0 ? userCategories[0].id : ''
            });
            
            // Закрытие компонента
            onClose();
        } catch (error) {
            // Обработка ошибки с детализацией
            console.error('Ошибка при добавлении операции:', error);
            const errorDetail = error.data?.detail || 
                              error.data?.message || 
                              error.error || 
                              'Неизвестная ошибка';
            alert(`Не удалось добавить операцию: ${errorDetail}`);
        }
    };

    // Функция для закрытия компонента с сбросом формы
    const handleClose = () => {
        setOperationData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            categoryId: userCategories.length > 0 ? userCategories[0].id : ''
        });
        onClose();
    };

    // Отображение состояния загрузки категорий
    if (isCategoriesLoading) {
        return (
            <div className={`add-operation-popup ${isOpen ? 'add-operation-popup__open' : ''}`}>
                <div className="popup-loader-container">
                    <Loader />
                    <p>Загрузка категорий...</p>
                </div>
            </div>
        );
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
                    {isAdding ? (
                        <>
                            <Loader />
                            <span>Сохранение...</span>
                        </>
                    ) : 'Сохранить'}
                </button>
                {isAdding && (
                    <div>
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddOperationPopup;