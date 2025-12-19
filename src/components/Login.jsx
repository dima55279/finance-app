import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { actions as authActions } from '../slices/authSlice';
import { selectors as usersSelectors } from '../slices/usersSlice';

function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const users = useSelector(usersSelectors.selectAll);
    const authError = useSelector(state => state.auth.error);
    const authLoading = useSelector(state => state.auth.loading);

    const validateForm = () => {
        const errors = {};
        
        if (!email.trim()) errors.email = 'Email обязателен!';
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Неверный формат email!';
        
        if (!password) errors.password = 'Пароль обязателен!';
        
        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        
        const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            dispatch(authActions.loginStart());
            
            const user = users.find(u => 
                u.email === email && u.password === password
            );
            
            if (!user) {
                throw new Error('Неверный email или пароль');
            }

            dispatch(authActions.loginSuccess(user));

            navigate('/profile');
        } catch (error) {
            dispatch(authActions.loginFailure(error.message));
            setErrors({ general: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <>
        <Header />
        <div className="login">
            <h1 className="login__heading">Вход в профиль</h1>
            <form className="login__form" onSubmit={handleSubmit}>
                <label>
                    Электронная почта:
                    <input type="email" name="email" className="login__form__input" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </label>
                {errors.email && <div className="login__error">{errors.email}</div>}
                <label>
                    Пароль:
                    <input type="password" name="password" className="login__form__input" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </label>
                {errors.password && <span className="login__error">{errors.password}</span>}
                <input 
                    type="submit" 
                    value={authLoading || isSubmitting ? "Вход..." : "Войти"} 
                    className="login__form__submit"
                    disabled={authLoading || isSubmitting}
                    formNoValidate
                />
            </form>
            <div className="login__question-block">
                <p>Ещё нет профиля?</p>
                <Link to="/registration" className="login__question-btn">Зарегистрироваться</Link>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Login;