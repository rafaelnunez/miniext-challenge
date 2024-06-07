import { createSlice } from '@reduxjs/toolkit';
import { loginWithEmail } from '../auth/loginWithEmail';
import { loginWithPhoneNumber, verifyPhoneNumberToLogin } from '../auth/loginWithPhoneNumber';
import { sendVerificationCode, verifyPhoneNumber } from '../auth/verifyPhoneNumber';

export interface LoadingStates {
    [key: string]: boolean;
}

const initialState: LoadingStates = {
    loginWithEmail: false,
    loginWithPhoneNumber: false,
    sendVerificationCode: false,
    verifyPhoneNumber: false,
    verifyPhoneNumberToLogin: false,
};

export const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginWithEmail.pending, (state) => {
            state.loginWithEmail = true;
        });
        builder.addCase(loginWithEmail.fulfilled, (state) => {
            state.loginWithEmail = false;
        });
        builder.addCase(loginWithEmail.rejected, (state) => {
            state.loginWithEmail = false;
        });
        builder.addCase(loginWithPhoneNumber.pending, (state) => {
            state.loginWithPhoneNumber = true;
        });
        builder.addCase(loginWithPhoneNumber.fulfilled, (state) => {
            state.loginWithPhoneNumber = false;
        });
        builder.addCase(loginWithPhoneNumber.rejected, (state) => {
            state.loginWithPhoneNumber = false;
        });
        // Send Verify Phone Number
        builder.addCase(sendVerificationCode.pending, (state) => {
            state.sendVerificationCode = true;
        });
        builder.addCase(sendVerificationCode.fulfilled, (state) => {
            state.sendVerificationCode = false;
        });
        builder.addCase(sendVerificationCode.rejected, (state) => {
            state.sendVerificationCode = false;
        });
        // Verify Phone Number to Update
        builder.addCase(verifyPhoneNumber.pending, (state) => {
            state.verifyPhoneNumber = true;
        });
        builder.addCase(verifyPhoneNumber.fulfilled, (state) => {
            state.verifyPhoneNumber = false;
        });
        builder.addCase(verifyPhoneNumber.rejected, (state) => {
            state.verifyPhoneNumber = false;
        });
        // Verify Phone Number to sing in/up
        builder.addCase(verifyPhoneNumberToLogin.pending, (state) => {
            state.verifyPhoneNumberToLogin = true;
        });
        builder.addCase(verifyPhoneNumberToLogin.fulfilled, (state) => {
            state.verifyPhoneNumberToLogin = false;
        });
        builder.addCase(verifyPhoneNumberToLogin.rejected, (state) => {
            state.verifyPhoneNumberToLogin = false;
        });
    },
});

export const loadingReducer = loadingSlice.reducer;
