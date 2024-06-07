import type { NextPage } from 'next';
import LoadingButton from './LoadingButton';
import Divider from './Divider';
import LoginWithGoogleButton from './LoginWithGoogleButton';
import Input from './Input';
import { useCallback, useEffect, useState } from 'react';
import SingInHeader from './SingInHeader';
import { useAppDispatch } from '../redux/store';
import { loginWithEmail, useIsLoginWithEmailLoading } from '../redux/auth/loginWithEmail';
import { isEmail } from 'validator';
import { useAuth } from '../useAuth';
import { useRouter } from 'next/navigation';
import { showToast } from '../redux/toast/toastSlice';
import Logout from './Logout';

/**
 * Use this component to add email/password or Google credentials to the user account
 * @returns
 */
const AddEmail: NextPage = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disableSubmitEmail, setDisableSubmitEmail] = useState(true);
    const isLoading = useIsLoginWithEmailLoading();

    useEffect(() => {
        if (isEmail(email) && password.length >= 6) {
            setDisableSubmitEmail(false);
        } else {
            setDisableSubmitEmail(true);
        }
    }, [email, password]);

    // Set new emal credentials to the user
    const LinkEmailCredentials = useCallback(async () => {
        // Add email and password to the user
        dispatch(
            loginWithEmail({
                type: 'add-credentials',
                email,
                password,
                auth: auth,
                callback: (result) => {
                    if (result.type === 'error') {
                        return;
                    }
                    dispatch(
                        showToast({
                            message: 'Credentials added successfully',
                            type: 'info',
                        })
                    );
                    router.refresh();
                },
            })
        );
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [email, password, dispatch]);

    const addGmailComponent = (
        <div className="mt-2 grid grid-cols-1 gap-3">
            <LoginWithGoogleButton />
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <SingInHeader />

                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
                    <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
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
                            onClick={LinkEmailCredentials}
                            disabled={disableSubmitEmail}
                            loading={isLoading}
                        >
                            Add
                        </LoadingButton>

                        <Divider label="Or add" />

                        {addGmailComponent}

                        <br />
                        <Logout />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmail;
