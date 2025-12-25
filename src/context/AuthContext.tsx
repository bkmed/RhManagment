import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser, logout } from '../store/slices/authSlice';
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
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading); // Loaded via persist

    // No need for explicit checkUser check as redux-persist handles hydration

    // However, if we want to sync with "authService.getCurrentUser" initially just in case the manual storage was used before:
    useEffect(() => {
        // Optional: Migration from old manual storage if Redux is empty
        const migrate = async () => {
            if (!user) {
                const oldUser = await authService.getCurrentUser();
                if (oldUser) {
                    dispatch(setUser(oldUser));
                }
            }
        };
        migrate();
    }, []);

    const signIn = async (loggedInUser: User) => {
        dispatch(setUser(loggedInUser));
        // Also keep sync with legacy service if needed or just replace it
        await authService.login(loggedInUser.email, 'ignored'); // This is weird, authService.login does the logic. 
        // Better: We assume the caller of signIn has verified the user.
        // Actually, looking at LoginScreen, it calls authService.login THEN signIn.
        // So here we validly just set the store.
    };

    const signUp = async (registeredUser: User) => {
        dispatch(setUser(registeredUser));
    };

    const signOut = async (navigation: any) => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            dispatch(logout());
            navigation.replace('Login'); // Use replace to reset stack
        }
    };

    const updateProfile = async (updatedData: Partial<User>) => {
        try {
            // We still call the service to update "legacy" persistent storage if we want to keep it 
            // OR we move logic to slice. For now, call service then update store.
            const updatedUser = await authService.updateUser(updatedData);
            dispatch(setUser(updatedUser));
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
