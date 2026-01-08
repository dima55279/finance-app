/* 
Компонент AddCategoryPopup. Используется для отображения попапа для добавления новой категории. 
Данный компонент содержит форму для ввода названия категории и выбора цвета. За основу для выбора цвета взята библиотека react-color-palette. 
*/
import React from 'react';
import { useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import { useAddCategoryMutation } from '../slices/api/categoriesApi';
import 'react-color-palette/css';
import Loader from './Loader';

// Основной компонент попапа для добавления новой категории
function AddCategoryPopup (props) {
    const { isOpen, onClose } = props;
    // Хук для управления выбранным цветом (начальный цвет #561ecb)
    const [color, setColor] = useColor("#561ecb");
    // Состояние для хранения названия категории
    const [categoryName, setCategoryName] = useState('');
    // Состояние для хранения типа категории (по умолчанию "расход")
    const [categoryType, setCategoryType] = useState('expense');

    // RTK Query мутация для добавления новой категории
    const [addCategory, { isLoading: isAddingCategory }] = useAddCategoryMutation();

    // Функция для сохранения новой категории
    const handleSaveCategory = async () => {
        // Проверка, что название категории не пустое
        if (!categoryName.trim()) {
            alert('Введите название категории.');
            return;
        }

        // Формирование объекта новой категории
        const newCategory = {
            name: categoryName,
            color: color.hex,
            category_type: categoryType,
        };

        try {
            // Отправка запроса на добавление категории
            await addCategory(newCategory).unwrap();
            
            // Сброс полей формы после успешного добавления
            setCategoryName('');
            setCategoryType('expense');
            // Закрытие компонента
            onClose();
        } catch (error) {
            // Обработка ошибки при добавлении категории
            console.error('Ошибка при добавлении категории:', error);
            alert('Не удалось добавить категорию');
        }
    };

    // Обработчик изменения названия категории
    const handleChangeCategoryName = (e) => {
        setCategoryName(e.target.value);
    };

    // Обработчик изменения типа категории
    const handleChangeCategoryType = (e) => {
        setCategoryType(e.target.value);
    };

    // Функция для закрытия компонента с сбросом полей формы
    const handleClose = () => {
        setCategoryName('');
        setCategoryType('expense');
        onClose();
    };

    return (
        <div className={`add-category-popup ${isOpen ? 'add-category-popup__open' : ''}`}>
            <div>
                <button className="add-category-popup__close-btn" type="button" aria-label="закрыть" onClick={handleClose}></button>
                <p>Выберите цвет для категории:</p>
                <ColorPicker hideInput={["rgb", "hsv"]} color={color} onChange={setColor}/>
                <div className="add-category-popup__input-div">
                    <label>
                        Название категории:
                        <input type="text" name="category" className="add-category-popup__input-category" 
                        value={categoryName} onChange={handleChangeCategoryName} placeholder="Введите название"/>
                    </label>
                    <label>
                        Тип категории:
                        <select className="add-category-popup__select-type" value={categoryType} onChange={handleChangeCategoryType}>
                            <option className="add-category-popup__select-type" value="expense">Расход</option>
                            <option className="add-category-popup__select-type" value="income">Доход</option>
                        </select>
                    </label>
                </div>
                <button type="button" aria-label="сохранить" className="add-category-popup__save-category-btn" onClick={handleSaveCategory} disabled={isAddingCategory}>
                    {isAddingCategory ? <Loader /> : 'Сохранить'}
                </button>
                {isAddingCategory && (
                    <div>
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCategoryPopup;