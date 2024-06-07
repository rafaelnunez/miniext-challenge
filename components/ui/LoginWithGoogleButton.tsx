import Image from 'next/image';
import GoogleGLogo from '@/public/statics/images/google-g-logo.svg';
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebaseAuth';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import { useRouter } from 'next/navigation';

const provider = new GoogleAuthProvider();

/**
 * Use this component to trigger Google modal and login with Google account
 * @returns
 */
const LoginWithGoogleButton = () => {
    const auth = useAuth();
    const router = useRouter();

    const loginWithGoogle = async () => {
        try {
            if (auth.type === LoadingStateTypes.LOADED) {
                await linkWithPopup(auth.user, provider);
                router.refresh();
                return;
            }

            const result = await signInWithPopup(firebaseAuth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            const user = result.user;
            console.log(user, token);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <button
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
            onClick={loginWithGoogle}
        >
            <Image src={GoogleGLogo} alt="Google logo" layout="intrinsic" height={20} width={20} />
            <div className="ml-2">Google</div>
        </button>
    );
};

export default LoginWithGoogleButton;
