import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (user: User) => Promise<void>;
    signUp: (user: User) => Promise<void>;
    signOut: (navigation: any) => Promise<void>;
    updateProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error checking user session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const signUp = async (registeredUser: User) => {
        setUser(registeredUser);
    };

    const signOut = async (navigation: any) => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Always clear local user state to redirect to Login
            setUser(null);
            navigation.navigate('Login');
        }
    };

    const updateProfile = async (updatedData: Partial<User>) => {
        try {
            const updatedUser = await authService.updateUser(updatedData);
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signUp,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
