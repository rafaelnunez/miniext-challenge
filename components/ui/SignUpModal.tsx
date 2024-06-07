import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { useAppDispatch } from '../redux/store';
import LoadingButton from './LoadingButton';
import LoginWithGoogleButton from './LoginWithGoogleButton';
import Input from './Input';
import { isEmail } from 'validator';
import { loginWithEmail, useIsLoginWithEmailLoading } from '../redux/auth/loginWithEmail';
import { RecaptchaVerifier } from 'firebase/auth';
import { showToast } from '../redux/toast/toastSlice';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import RadioGroup, { Radio } from './RadioGroup';
import { CredentialTypes } from '../enum/credentialTypes';
import Divider from './Divider';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
    loginWithPhoneNumber,
    useIsLoginWithPhoneNumberLoading,
    verifyPhoneNumberToLogin,
    useVerifyPhoneNumberToLoginLoading,
} from '../redux/auth/loginWithPhoneNumber';

interface SignUpModalProps {
    open: boolean;
    setOpen: (show: boolean) => void;
}
const SignUpModal = (props: SignUpModalProps) => {
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disableSubmitEmail, setDisableSubmitEmail] = useState(true);
    const isLoadingWithEmail = useIsLoginWithEmailLoading();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [disableSubmitPhone, setDisableSubmitPhone] = useState(true);
    const isLoginWithPhoneNumber = useIsLoginWithPhoneNumberLoading();
    const sendVerificationLoading = useVerifyPhoneNumberToLoginLoading();
    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [otp, setOtp] = useState('');
    const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);

    const [signUpType, setSignUpType] = useState('email');
    const signUpTypesOptions: Radio[] = [
        {
            name: 'email-signup',
            label: 'Email',
            value: 'email',
        },
        {
            name: 'phone-signup',
            label: 'Phone',
            value: 'phone',
        },
    ];

    // validate email and password
    useEffect(() => {
        if (isEmail(email) && password.length >= 6) {
            setDisableSubmitEmail(false);
        } else {
            setDisableSubmitEmail(true);
        }
    }, [email, password]);

    // validate phone number
    useEffect(() => {
        if (phoneNumber.length < 10) {
            setDisableSubmitPhone(true);
        } else {
            setDisableSubmitPhone(false);
        }
    }, [phoneNumber]);

    // Signup with email and password and redirecting to home page
    const signUpWithEmail = useCallback(async () => {
        // verify the user email before signup
        dispatch(
            loginWithEmail({
                type: 'sign-up',
                email,
                password,
            })
        );
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [email, password, dispatch]);

    // generating the recaptcha on page render
    useEffect(() => {
        if (CredentialTypes.EMAIL === signUpType) return;
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
    }, [signUpType]);

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        dispatch(
            loginWithPhoneNumber({
                type: 'sign-up',
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
        }
    };

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

    const signUpWithPhoneNumberComponent = (
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

    const signUpWithEmailComponent = (
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
            <LoadingButton
                onClick={signUpWithEmail}
                disabled={disableSubmitEmail}
                loading={isLoadingWithEmail}
            >
                Sign Up
            </LoadingButton>
        </>
    );

    const signUpWithGmailComponent = (
        <div className="mt-2 grid grid-cols-1 gap-3">
            <LoginWithGoogleButton />
        </div>
    );

    return (
        <Modal show={props.open} setShow={props.setOpen}>
            <div className="max-w-md w-full bg-white py-6 rounded-lg">
                <h2 className="text-lg font-semibold text-center mb-0">Sign Up</h2>
                <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
                    <p className="pb-0 text-gray-600">How do you prefer to sign up?</p>
                    <RadioGroup
                        options={signUpTypesOptions}
                        selectedValue={signUpType}
                        onChange={setSignUpType}
                    />
                    {CredentialTypes.PHONE === signUpType && signUpWithPhoneNumberComponent}
                    {CredentialTypes.EMAIL === signUpType && signUpWithEmailComponent}
                    <Divider label="Or sign up with" />
                    {signUpWithGmailComponent}
                </div>
            </div>
        </Modal>
    );
};

export default SignUpModal;
