import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import { useRegisterMutation } from '../slices/api/usersApi';

function Registration() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();


  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.get('name').trim()) errors.name = 'Имя обязательно!';
    if (!formData.get('surname').trim()) errors.surname = 'Фамилия обязательна!';
    if (!formData.get('email').trim()) errors.email = 'Email обязателен!';
    else if (!/^\S+@\S+\.\S+$/.test(formData.get('email'))) errors.email = 'Неверный формат email!';
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!password) errors.password = 'Пароль обязателен!';
    else if (password.length < 6) errors.password = 'Пароль должен быть не менее 6 символов!';
    
    if (!confirmPassword) errors.confirmPassword = 'Подтверждение пароля обязательно!';
    else if (password !== confirmPassword) errors.confirmPassword = 'Пароли не совпадают!';
    
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    const data = new FormData(event.target);
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        name: data.get('name'),
        surname: data.get('surname'),
        email: data.get('email'),
        password: data.get('password'),
      };
      
      const result = await registerMutation(userData).unwrap();

      setTimeout(() => {
        navigate('/profile');
      }, 100);
      
    } catch (error) {
      const errorMessage = error.data?.detail || error.data?.message || error.message || 'Ошибка при регистрации. Попробуйте снова.';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="registration">
        {(registerLoading || isSubmitting) && <Loader />}
        <h1 className="registration__heading">Регистрация</h1>
        <form className="registration__form" onSubmit={handleSubmit}>
          <label>
            Имя:
            <input 
              type="text" 
              name="name" 
              className="registration__form__input" 
              required 
              disabled={registerLoading || isSubmitting}
            />
          </label>
          {errors.name && <span className="registration__error">{errors.name}</span>}
          <label>
            Фамилия:
            <input 
              type="text" 
              name="surname" 
              className="registration__form__input" 
              required 
              disabled={registerLoading || isSubmitting}
            />
          </label>
          {errors.surname && <span className="registration__error">{errors.surname}</span>}
          <label>
            Электронная почта:
            <input 
              type="email" 
              name="email" 
              className="registration__form__input" 
              required 
              disabled={registerLoading || isSubmitting}
            />
          </label>
          {errors.email && <span className="registration__error">{errors.email}</span>}
          <label>
            Пароль:
            <input 
              type="password" 
              name="password" 
              className="registration__form__input" 
              required 
              disabled={registerLoading || isSubmitting}
            />
          </label>
          {errors.password && <span className="registration__error">{errors.password}</span>}
          <label>
            Повторите пароль:
            <input 
              type="password" 
              name="confirmPassword" 
              className="registration__form__input" 
              minLength="6" 
              required 
              disabled={registerLoading || isSubmitting}
            />
          </label>
          {errors.confirmPassword && <span className="registration__error">{errors.confirmPassword}</span>}
          {errors.general && <div className="registration__error">{errors.general}</div>}
          <button 
            type="submit" 
            className="registration__form__submit" 
            disabled={registerLoading || isSubmitting} 
            formNoValidate
          >
            {registerLoading || isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="registration__question-block">
          <p>Уже зарегистрированы?</p>
          <Link to="/login" className="registration__question-btn">Войти в профиль</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Registration;