import React from 'react';
import { useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import { useAddCategoryMutation } from '../slices/api/categoriesApi';
import 'react-color-palette/css'

function AddCategoryPopup (props) {
    const { isOpen, onClose } = props;
    const [color, setColor] = useColor("#561ecb");
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState('expense');

    const [addCategory] = useAddCategoryMutation();

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            alert('Введите название категории.');
            return;
        }

        const newCategory = {
            name: categoryName,
            color: color.hex,
            category_type: categoryType,
        };

        try {
            await addCategory(newCategory).unwrap();
            
            setCategoryName('');
            setCategoryType('expense');
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении категории:', error);
            alert('Не удалось добавить категорию');
        }
    };

    const handleChangeCategoryName = (e) => {
        setCategoryName(e.target.value);
    };

    const handleChangeCategoryType = (e) => {
        setCategoryType(e.target.value);
    };

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
                <button type="button" aria-label="сохранить" className="add-category-popup__save-category-btn" onClick={handleSaveCategory}>Сохранить</button>
            </div>
        </div>
    );
};

export default AddCategoryPopup;