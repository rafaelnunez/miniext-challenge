/* eslint-disable @next/next/no-img-element */
import { NextPage } from 'next';
import { GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { useAuth } from '@/components/useAuth';
import Spinner from '@/components/Spinner';
import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import SignUpModal from '@/components/ui/SignUpModal';
import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
import { LoadingStateTypes } from '@/components/redux/types';
import RadioGroup, { Radio } from '@/components/ui/RadioGroup';
import Divider from '@/components/ui/Divider';
import { CredentialTypes } from '@/components/enum/credentialTypes';
import { PhoneInput } from 'react-international-phone';
import {
    loginWithPhoneNumber,
    useIsLoginWithPhoneNumberLoading,
    useVerifyPhoneNumberToLoginLoading,
    verifyPhoneNumberToLogin,
} from '@/components/redux/auth/loginWithPhoneNumber';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { showToast } from '@/components/redux/toast/toastSlice';
import Modal from '@/components/ui/Modal';
import SingInHeader from '@/components/ui/SingInHeader';

export const googleLoginProvider = new GoogleAuthProvider();

const LoginPage: NextPage = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [disableSubmitPhone, setDisableSubmitPhone] = useState(true);
    const [disableSubmit, setDisableSubmit] = useState(true);
    const isLoading = useIsLoginWithEmailLoading();
    const [signInType, setSignInType] = useState('email');

    const sendVerificationLoading = useVerifyPhoneNumberToLoginLoading();
    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [otp, setOtp] = useState('');
    const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
    const isLoginWithPhoneNumber = useIsLoginWithPhoneNumberLoading();

    const signInTypesOptions: Radio[] = [
        {
            name: 'email-signin',
            label: 'Email',
            value: 'email',
        },
        {
            name: 'phone-signin',
            label: 'Phone',
            value: 'phone',
        },
    ];

    const [showRegistration, setshowRegistration] = useState(false);
    const router = useRouter();

    // Realtime validation to enable submit button
    useEffect(() => {
        if (email && password.length >= 6) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    }, [email, password]);

    useEffect(() => {
        if (phoneNumber.length < 10) {
            setDisableSubmitPhone(true);
        } else {
            setDisableSubmitPhone(false);
        }
    }, [phoneNumber]);

    // generating the recaptcha on page render
    useEffect(() => {
        if (CredentialTypes.EMAIL === signInType) return;
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
                setRecaptchaResolved(true);
            },

            'expired-callback': () => {
                setRecaptchaResolved(false);
                dispatch(
                    showToast({
                        message: 'Recaptcha Expired, please verify it again',
                        type: 'info',
                    })
                );
            },
        });

        captcha.render();

        setRecaptcha(captcha);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [signInType]);

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        dispatch(
            loginWithPhoneNumber({
                type: 'login',
                phoneNumber: phoneNumber,
                recaptchaResolved: recaptchaResolved,
                recaptcha,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    window.confirmationResult = result.confirmationResult;
                    setShowVerifyOtpModal(true);
                },
            })
        );
    };

    const verifyOtp = async () => {
        if (otp.length === 6) {
            dispatch(
                verifyPhoneNumberToLogin({
                    OTPCode: otp,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    confirmationResult: window.confirmationResult,
                    callback: (result) => {
                        if (result.type === 'error') {
                            return;
                        }
                    },
                })
            );
        } else {
            dispatch(
                showToast({
                    message: 'Enter a valid OTP',
                    type: 'info',
                })
            );
        }
    };

    // Signing in with email and password and redirecting to home page
    const signInWithEmail = useCallback(async () => {
        await dispatch(
            loginWithEmail({
                type: 'login',
                email,
                password,
            })
        );
    }, [email, password, dispatch]);

    if (auth.type === LoadingStateTypes.LOADING) {
        return <Spinner />;
    } else if (auth.type === LoadingStateTypes.LOADED) {
        router.push('/');
        return <Spinner />;
    }

    const verifyOtpModal = (
        <Modal show={showVerifyOtpModal} setShow={setShowVerifyOtpModal}>
            <div className="max-w-md w-full bg-white py-6 rounded-lg">
                <h2 className="text-lg font-semibold text-center mb-10">Enter Code to Verify</h2>
                <div className="px-4 flex  justify-center gap-4 pb-10">
                    <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Entry your OTP"
                        type="text"
                    />
                    <LoadingButton
                        onClick={verifyOtp}
                        loading={sendVerificationLoading}
                        loadingText="Verifying..."
                    >
                        Verify
                    </LoadingButton>
                </div>
            </div>
        </Modal>
    );

    const signInWithPhoneNumberComponent = (
        <>
            <PhoneInput
                defaultCountry="us"
                placeholder="Phone number"
                inputClassName="w-full"
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
            />
            <div id="recaptcha-container" />
            <LoadingButton
                loading={isLoginWithPhoneNumber}
                loadingText="Sending OTP"
                disabled={disableSubmitPhone}
                onClick={handleSendVerification}
            >
                Send OTP
            </LoadingButton>
            {verifyOtpModal}
        </>
    );

    const signInWithEmailComponent = (
        <>
            <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                name="email"
                type="text"
            />
            <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                name="password"
                type="password"
            />
            <LoadingButton onClick={signInWithEmail} disabled={disableSubmit} loading={isLoading}>
                Sign In
            </LoadingButton>
        </>
    );

    const signInWithGmailComponent = (
        <div className="mt-2 grid grid-cols-1 gap-3">
            <LoginWithGoogleButton />
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <SingInHeader />

                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
                    <div className="flex gap-4 mb-5 flex-col">
                        <p className="pb-0 text-gray-600">How do you prefer to sign in?</p>
                        <RadioGroup
                            options={signInTypesOptions}
                            selectedValue={signInType}
                            onChange={setSignInType}
                        />
                        {CredentialTypes.PHONE === signInType && signInWithPhoneNumberComponent}
                        {CredentialTypes.EMAIL === signInType && signInWithEmailComponent}

                        <Divider label="Or login with" />

                        {signInWithGmailComponent}

                        <div className="mt-6">
                            <div className="flex justify-center">
                                <div className="relative flex justify-center text-sm">
                                    <div className="font-small text-black-400">
                                        Don&apos;t have an account?
                                    </div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <div
                                        onClick={() => setshowRegistration(true)}
                                        className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
                                    >
                                        Sign Up
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SignUpModal open={showRegistration} setOpen={setshowRegistration} />
                </div>
            </div>
            <ToastBox />
        </div>
    );
};

export default LoginPage;
