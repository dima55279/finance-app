/* 
Компонент Registration. Используется для отображения формы регистрации нового пользователя. 
Данный компонент содержит форму регистрации, логотип приложения и кнопку перехода на страницу входа. 
*/
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import { useRegisterMutation } from '../slices/api/usersApi';

// Компонент страницы регистрации нового пользователя
function Registration() {
  // Хук для навигации между страницами
  const navigate = useNavigate();
  // Состояние для хранения ошибок валидации формы
  const [errors, setErrors] = useState({});
  // Состояние для отслеживания процесса отправки формы
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RTK Query мутация для регистрации пользователя с состоянием загрузки
  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();

  // Функция валидации данных формы регистрации
  const validateForm = (formData) => {
    const errors = {};
    
    // Проверка наличия имени
    if (!formData.get('name').trim()) errors.name = 'Имя обязательно!';
    // Проверка наличия фамилии
    if (!formData.get('surname').trim()) errors.surname = 'Фамилия обязательна!';
    // Проверка наличия и формата email
    if (!formData.get('email').trim()) errors.email = 'Email обязателен!';
    else if (!/^\S+@\S+\.\S+$/.test(formData.get('email'))) errors.email = 'Неверный формат email!';
    
    // Получение паролей для сравнения
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Проверка наличия и минимальной длины пароля
    if (!password) errors.password = 'Пароль обязателен!';
    else if (password.length < 6) errors.password = 'Пароль должен быть не менее 6 символов!';
    
    // Проверка подтверждения пароля
    if (!confirmPassword) errors.confirmPassword = 'Подтверждение пароля обязательно!';
    else if (password !== confirmPassword) errors.confirmPassword = 'Пароли не совпадают!';
    
    return errors;
  };

  // Обработчик отправки формы регистрации
  const handleSubmit = async (event) => {
    // Предотвращение стандартного поведения формы
    event.preventDefault();
    // Установка состояния отправки
    setIsSubmitting(true);
    // Сброс предыдущих ошибок
    setErrors({});
    
    // Создание объекта FormData из формы
    const data = new FormData(event.target);
    // Валидация формы
    const validationErrors = validateForm(data);
    
    // Если есть ошибки валидации, отображаем их и прерываем отправку
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Формирование объекта данных пользователя
      const userData = {
        name: data.get('name'),
        surname: data.get('surname'),
        email: data.get('email'),
        password: data.get('password'),
      };
      
      // Вызов мутации регистрации
      const result = await registerMutation(userData).unwrap();

      // Небольшая задержка перед перенаправлением на страницу профиля
      setTimeout(() => {
        navigate('/profile');
      }, 100);
      
    } catch (error) {
      // Обработка ошибок регистрации с извлечением детального сообщения
      const errorMessage = error.data?.detail || error.data?.message || error.message || 'Ошибка при регистрации. Попробуйте снова.';
      setErrors({ general: errorMessage });
    } finally {
      // Сброс состояния отправки формы
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Отображение компонентов шапки, основного содержимого и подвала */}
      <Header />
      <div className="registration">
        {/* Индикатор загрузки при отправке формы */}
        {(registerLoading || isSubmitting) && <Loader />}
        <h1 className="registration__heading">Регистрация</h1>
        <form className="registration__form" onSubmit={handleSubmit}>
          <label>
            Имя:
            <input type="text" name="name" className="registration__form__input" 
              required disabled={registerLoading || isSubmitting}/>
          </label>
          {/* Отображение ошибок валидации имени */}
          {errors.name && <span className="registration__error">{errors.name}</span>}
          <label>
            Фамилия:
            <input type="text" name="surname" className="registration__form__input" 
              required disabled={registerLoading || isSubmitting}/>
          </label>
          {/* Отображение ошибок валидации фамилии */}
          {errors.surname && <span className="registration__error">{errors.surname}</span>}
          <label>
            Электронная почта:
            <input type="email" name="email" className="registration__form__input" 
              required disabled={registerLoading || isSubmitting}/>
          </label>
          {/* Отображение ошибок валидации email */}
          {errors.email && <span className="registration__error">{errors.email}</span>}
          <label>
            Пароль:
            <input type="password" name="password" className="registration__form__input" 
              required disabled={registerLoading || isSubmitting}/>
          </label>
          {/* Отображение ошибок валидации пароля */}
          {errors.password && <span className="registration__error">{errors.password}</span>}
          <label>
            Повторите пароль:
            <input type="password" name="confirmPassword" className="registration__form__input" 
              minLength="6" required disabled={registerLoading || isSubmitting}/>
          </label>
          {/* Отображение ошибок подтверждения пароля */}
          {errors.confirmPassword && <span className="registration__error">{errors.confirmPassword}</span>}
          {/* Отображение общих ошибок (например, email уже занят) */}
          {errors.general && <div className="registration__error">{errors.general}</div>}
          {/* Кнопка отправки формы */}
          <button type="submit" className="registration__form__submit" 
            disabled={registerLoading || isSubmitting} formNoValidate>
            {registerLoading || isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="registration__question-block">
          <p>Уже зарегистрированы?</p>
          {/* Ссылка на страницу входа */}
          <Link to="/login" className="registration__question-btn">Войти в профиль</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Registration;