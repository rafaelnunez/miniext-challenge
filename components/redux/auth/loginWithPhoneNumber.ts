import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import { RootState, useAppSelector } from '../store';
import { useSelector } from 'react-redux';

export const loginWithPhoneNumber = createAsyncThunk(
    'login-with-phone-number',
    async (
        args: {
            type: 'login' | 'sign-up';
            phoneNumber: string;
            recaptchaResolved: boolean;
            recaptcha: RecaptchaVerifier | null;
            callback: (
                args:
                    | { type: 'success'; confirmationResult: ConfirmationResult }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        if (args.recaptchaResolved === false || args.recaptcha === null) {
            dispatch(showToast({ message: 'First Resolved the Captcha', type: 'info' }));
            return;
        }
        try {
            const sentConfirmationCode = await signInWithPhoneNumber(
                firebaseAuth,
                args.phoneNumber,
                args.recaptcha!
            );
            dispatch(
                showToast({
                    message: 'Verification Code has been sent to your Phone',
                    type: 'success',
                })
            );
            args.callback({ type: 'success', confirmationResult: sentConfirmationCode });
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

export const useIsLoginWithPhoneNumberLoading = () => {
    const loading = useAppSelector((state) => state.loading.loginWithPhoneNumber);
    return loading;
};

export const verifyPhoneNumberToLogin = createAsyncThunk(
    'verifyPhoneNumberToLogin',
    async (
        args: {
            OTPCode: string;
            confirmationResult: ConfirmationResult;
            callback: (
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
        if (args.OTPCode === null || !args.confirmationResult) return;

        try {
            await args.confirmationResult.confirm(args.OTPCode);

            dispatch(
                showToast({
                    message: 'Logged in Successfully',
                    type: 'success',
                })
            );

            args.callback({ type: 'success' });
        } catch (error: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                });
        }
    }
);

export const useVerifyPhoneNumberToLoginLoading = () => {
    const loading = useSelector((state: RootState) => state.loading.verifyPhoneNumberToLogin);
    return loading;
};
