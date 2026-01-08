/* 
Компонент UpdateAvatarPopup. Используется для отображения попапа для обновления аватара пользователя. 
Данный компонент содержит форму для выбора файла изображения, предпросмотр изображения и кнопку сохранения. 
*/
import React from 'react';
import { useState } from 'react';
import { useUpdateUserAvatarMutation } from '../slices/api/usersApi';

// Компонент попапа для обновления аватара пользователя
function UpdateAvatarPopup(props) {
  // Получение пропсов: состояние открытия компонента и функция закрытия
  const { isOpen, onClose } = props;

  // Состояние для хранения выбранного файла изображения
  const [selectedFile, setSelectedFile] = useState(null);
  // Состояние для хранения URL предпросмотра изображения
  const [previewUrl, setPreviewUrl] = useState('');
  // Состояние для хранения ошибок
  const [error, setError] = useState('');
  
  // RTK Query мутация для обновления аватара пользователя с состоянием загрузки
  const [updateUserAvatar, { isLoading }] = useUpdateUserAvatarMutation();
  
  // Обработчик изменения выбранного файла
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка, что выбранный файл является изображением
      if (!file.type.match('image.*')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      // Обновление состояния выбранного файла и сброс ошибок
      setSelectedFile(file);
      setError('');

      // Создание FileReader для предпросмотра изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для сохранения нового аватара
  const handleSave = async () => {
    // Проверка, что файл был выбран
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    try {
      // Получение ID пользователя из localStorage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('Пользователь не найден');
        return;
      }

      // Конвертация файла в base64 строку
      const base64String = await convertToBase64(selectedFile);

      // Вызов мутации для обновления аватара
      await updateUserAvatar({ 
        userId: parseInt(userId), 
        avatar: base64String 
      }).unwrap();

      // Закрытие компонента после успешного обновления
      onClose();

      // Сброс состояния формы
      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
      
    } catch (error) {
      // Обработка ошибок при обновлении аватара
      console.error('Ошибка при обновлении аватара:', error);
      const errorDetail = error.data?.detail || error.data?.message || 'Неизвестная ошибка';
      setError(`Произошла ошибка при обновлении аватара: ${errorDetail}`);
    }
  };

  // Функция для конвертации файла в base64 строку
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Функция для закрытия компонента с сбросом состояния
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    onClose();
  };

  return (
    <div className={`avatar-popup ${isOpen ? 'avatar-popup__open' : ''}`}>
      <div>
        <button className="avatar-popup__close-btn" type="button" aria-label="закрыть" onClick={handleClose}></button>
        <h2>Обновить фотографию профиля</h2>
        <div>
          <div>
            <div>
              {/* Отображение предпросмотра выбранного изображения */}
              {previewUrl ? (
                <img src={previewUrl} alt="Предпросмотр" className="avatar-popup__preview"/>
              ) : (
                <div>
                  Выберите изображение
                </div>
              )}
            </div>
            
            {/* Поле выбора файла */}
            <label className="avatar-popup__input-div">
              <input type="file" accept="image/*" onChange={handleFileChange} className="avatar-popup__input-avatar" disabled={isLoading}/>
            </label>
          </div>
          
          <div>
            {/* Кнопка сохранения аватара */}
            <button type="button" className="avatar-popup__save-avatar-btn" onClick={handleSave} disabled={!selectedFile || isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
            {/* Кнопка отмены */}
            <button type="button" className="avatar-popup__cancel-avatar-btn" onClick={handleClose} disabled={isLoading}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateAvatarPopup;