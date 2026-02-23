import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session on mount
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    _id: session.user.id,
                    name: session.user.user_metadata?.name || 'User',
                    email: session.user.email,
                    role: session.user.user_metadata?.role || 'Patient',
                    token: session.access_token,
                });
            }
            setLoading(false);
        };
        getSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    _id: session.user.id,
                    name: session.user.user_metadata?.name || 'User',
                    email: session.user.email,
                    role: session.user.user_metadata?.role || 'Patient',
                    token: session.access_token,
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                return { success: false, message: error.message };
            }
            if (data.user) {
                const userData = {
                    _id: data.user.id,
                    name: data.user.user_metadata?.name || 'User',
                    email: data.user.email,
                    role: data.user.user_metadata?.role || 'Patient',
                    token: data.session.access_token,
                };
                setUser(userData);
                // Keep localStorage token for backward compatibility with the backend API interceptor
                localStorage.setItem('token', data.session.access_token);
                return { success: true, role: userData.role };
            }
            return { success: false, message: 'Login failed. Please try again.' };
        } catch (err) {
            return { success: false, message: err.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role || 'Patient',
                    },
                },
            });
            if (error) {
                return { success: false, message: error.message };
            }
            if (data.user) {
                if (data.session) {
                    localStorage.setItem('token', data.session.access_token);
                }
                return { success: true, message: 'Registration successful. Please verify your email if required.' };
            }
            return { success: false, message: 'Registration failed.' };
        } catch (err) {
            return { success: false, message: err.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
