import React from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css'

function AddCategoryPopup (props) {
    const { isOpen, onClose, userId } = props;
    const [color, setColor] = useColor("#561ecb");
    const onChangeComplete = (color) => {
        localStorage.setItem("userColor", color.hex);
    };
    return (
        <div className={`colorPicker ${isOpen ? 'colorPicker__open' : ''}`}>
            <div>
                <button className="colorPicker__close-btn" type="button" aria-label="закрыть" onClick={onClose}></button>
                <p>Выберите цвет для категории:</p>
                <ColorPicker hideInput={["rgb", "hsv"]} color={color} onChange={setColor} onChangeComplete={onChangeComplete}/>
                <div className="category-popup__input-div">
                    <label>
                        Название категории:
                        <input type="text" name="category" className="category-popup__input-category"/>
                    </label>
                </div>
                <button type="button" aria-label="сохранить" className="category-popup__save-category-btn">Сохранить</button>
            </div>
        </div>
    );
};

export default AddCategoryPopup;