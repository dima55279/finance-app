import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { actions as usersActions } from '../slices/usersSlice';
import { actions as authActions } from '../slices/authSlice';


function Registration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      dispatch(authActions.registerStart());
      
      const user = {
        id: _.uniqueId(),
        name: data.get('name'),
        surname: data.get('surname'),
        email: data.get('email'),
        password: data.get('password'),
        budgetLimit: 0,
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(usersActions.addUser(user));

      dispatch(authActions.registerSuccess(user));

      navigate('/profile');
    } catch (error) {
      dispatch(authActions.registerFailure(error.message));
      setErrors({ general: 'Ошибка при регистрации. Попробуйте снова.' });
    } finally {
      setIsSubmitting(false);
    }
  };


    return (
        <>
        <Header />
        <div className="registration">
            <h1 className="registration__heading">Регистрация</h1>
            <form className="registration__form" onSubmit={ handleSubmit }>
                <label>
                    Имя:
                    <input type="text" name="name" className="registration__form__input" required />
                </label>
                {errors.name && <span className="registration__error">{errors.name}</span>}
                <label>
                    Фамилия:
                    <input type="text" name="surname" className="registration__form__input" required />
                </label>
                {errors.surname && <span className="registration__error">{errors.surname}</span>}
                <label>
                    Электронная почта:
                    <input type="email" name="email" className="registration__form__input" required />
                </label>
                {errors.email && <span className="registration__error">{errors.email}</span>}
                <label>
                    Пароль:
                    <input type="password" name="password" className="registration__form__input" required />
                </label>
                {errors.password && <span className="registration__error">{errors.password}</span>}
                <label>
                    Повторите пароль:
                    <input type="password" name="confirmPassword" className="registration__form__input" minLength="6" required/>
                </label>
                {errors.confirmPassword && <span className="registration__error">{errors.confirmPassword}</span>}
                <button type="submit" className="registration__form__submit" disabled={isSubmitting} formNoValidate>
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
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