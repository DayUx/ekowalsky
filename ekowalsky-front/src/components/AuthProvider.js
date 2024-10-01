import React from 'react';

export const AuthContext = React.createContext(null);

export function AuthProvider ({ children }) {
    const [user, setUser] = React.useState(localStorage.getItem('user'));

    const handleLogin = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');

        setUser(null);
    };

    const value = {
        user,
        onLogin: handleLogin,
        onLogout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};