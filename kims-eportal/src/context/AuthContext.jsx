import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHolidayToday, setIsHolidayToday] = useState(false);

    useEffect(() => {
        const checkTodayHoliday = async () => {
            try {
                const res = await API.get("/holidays");
                if (res.data) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const hasHoliday = Array.isArray(res.data) && res.data.some(h => {
                        if (!h.date) return false;
                        let hDate;
                        const dmyMatch = h.date.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
                        if (dmyMatch) {
                            let year = parseInt(dmyMatch[3]);
                            if (year < 100) year += 2000;
                            hDate = new Date(year, dmyMatch[2] - 1, dmyMatch[1]);
                        } else {
                            const cleaned = h.date.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
                            hDate = new Date(cleaned);
                        }
                        if (isNaN(hDate.getTime())) return false;
                        hDate.setHours(0, 0, 0, 0);
                        return hDate.getTime() === today.getTime();
                    });
                    setIsHolidayToday(!!hasHoliday);
                }
            } catch (err) {
                console.error("Global holiday check failed:", err);
            }
        };

        try {
            const storedUser = localStorage.getItem('kims_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            checkTodayHoliday();
        } catch (error) {
            console.error("Failed to parse stored user:", error);
            localStorage.removeItem('kims_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const res = await API.post('/login', { username, password });
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('kims_user', JSON.stringify(res.data.user));
                localStorage.setItem('kims_token', res.data.token);
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            if (user?.id) {
                await API.post('/logout', { userId: user.id });
            }
        } catch (err) {
            console.error("Failed to notify server of logout:", err);
        } finally {
            setUser(null);
            localStorage.removeItem('kims_user');
            localStorage.removeItem('kims_token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isHolidayToday }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
