// Login.jsx
import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useLoginMutation } from '../slices/api/usersApi'; // УБРАТЬ useGetCurrentUserQuery

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [loginMutation, { isLoading: authLoading }] = useLoginMutation();

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
            const credentials = { email, password };
            const result = await loginMutation(credentials).unwrap();
            navigate('/profile');
            
        } catch (error) {
            const errorMessage = error.data?.detail || error.data?.message || error.message || 'Неверный email или пароль';
            setErrors({ general: errorMessage });
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
                    <input 
                        type="email" 
                        name="email" 
                        className="login__form__input" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                        disabled={authLoading || isSubmitting}
                    />
                </label>
                {errors.email && <div className="login__error">{errors.email}</div>}
                <label>
                    Пароль:
                    <input 
                        type="password" 
                        name="password" 
                        className="login__form__input" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                        disabled={authLoading || isSubmitting}
                    />
                </label>
                {errors.password && <span className="login__error">{errors.password}</span>}
                {errors.general && <div className="login__error">{errors.general}</div>}
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