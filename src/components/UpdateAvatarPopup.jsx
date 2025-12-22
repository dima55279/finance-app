import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { actions as usersActions } from '../slices/usersSlice';
import { actions as authActions } from '../slices/authSlice';

function UpdateAvatarPopup(props) {
    const { isOpen, onClose, userId } = props;
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('Пожалуйста, выберите файл изображения');
                return;
            }

            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!selectedFile) {
            alert('Пожалуйста, выберите файл');
            return;
        }

        setIsLoading(true);

        try {
            const base64String = await convertToBase64(selectedFile);

            dispatch(usersActions.updateUser({
                id: userId,
                changes: { avatar: base64String }
            }));

            dispatch(usersActions.updateUserAvatar({ userId, avatar: base64String }));

            dispatch(authActions.updateAvatar(base64String));

            onClose();

            setSelectedFile(null);
            setPreviewUrl('');
            
        } catch (error) {
            console.error('Ошибка при обновлении аватара:', error);
            alert('Произошла ошибка при обновлении аватара');
        } finally {
            setIsLoading(false);
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