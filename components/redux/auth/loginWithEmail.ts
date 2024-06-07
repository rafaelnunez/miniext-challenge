import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    EmailAuthProvider,
    createUserWithEmailAndPassword,
    linkWithCredential,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import isEmail from 'validator/lib/isEmail';
import { useAppSelector } from '../store';
import { AuthContextType } from '@/components/useAuth';

export const loginWithEmail = createAsyncThunk(
    'login',
    async (
        args: {
            type: 'login' | 'sign-up' | 'add-credentials';
            email: string;
            password: string;
            auth?: AuthContextType | null;
            callback?: (
                args:
                    | { type: 'success' }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        try {
            if (!isEmail(args.email)) {
                dispatch(
                    showToast({
                        message: 'Enter a valid email',
                        type: 'info',
                    })
                );
                return;
            }
            if (args.password.length < 6) {
                dispatch(
                    showToast({
                        message: 'Password should be atleast 6 characters',
                        type: 'info',
                    })
                );
                return;
            }

            if (args.type === 'add-credentials') {
                if (args.auth) {
                    const authCredential = EmailAuthProvider.credential(args.email, args.password);
                    await linkWithCredential(args.auth?.user, authCredential);
                    args.callback!({ type: 'success' });
                } else {
                    dispatch(
                        showToast({
                            message: 'Please login to add email',
                            type: 'info',
                        })
                    );
                }
                return;
            }

            if (args.type === 'sign-up') {
                await createUserWithEmailAndPassword(firebaseAuth, args.email, args.password);
            }

            await signInWithEmailAndPassword(firebaseAuth, args.email, args.password);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(e.code),
                    type: 'error',
                })
            );
        }
    }
);

export const useIsLoginWithEmailLoading = () => {
    const loading = useAppSelector((state) => state.loading.loginWithEmail);
    return loading;
};
