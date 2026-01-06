import React from 'react';
import { useState } from 'react';
import { useUpdateUserAvatarMutation } from '../slices/api/usersApi';

function UpdateAvatarPopup(props) {
  const { isOpen, onClose } = props;

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  
  const [updateUserAvatar, { isLoading }] = useUpdateUserAvatarMutation();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      setSelectedFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('Пользователь не найден');
        return;
      }

      const base64String = await convertToBase64(selectedFile);

      await updateUserAvatar({ 
        userId: parseInt(userId), 
        avatar: base64String 
      }).unwrap();

      onClose();

      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
      
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      const errorDetail = error.data?.detail || error.data?.message || 'Неизвестная ошибка';
      setError(`Произошла ошибка при обновлении аватара: ${errorDetail}`);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

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
              {previewUrl ? (
                <img src={previewUrl} alt="Предпросмотр" className="avatar-popup__preview"/>
              ) : (
                <div>
                  Выберите изображение
                </div>
              )}
            </div>
            
            <label className="avatar-popup__input-div">
              <input type="file" accept="image/*" onChange={handleFileChange} className="avatar-popup__input-avatar" disabled={isLoading}/>
            </label>
          </div>
          
          <div>
            <button type="button" className="avatar-popup__save-avatar-btn" onClick={handleSave} disabled={!selectedFile || isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
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