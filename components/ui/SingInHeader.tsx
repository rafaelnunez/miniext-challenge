import type { NextPage } from 'next';
import Image from 'next/image';

const SingInHeader: NextPage = () => {
    return (
        <div>
            <Image
                width={80}
                height={48}
                className="mx-auto"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                alt="Workflow"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                Sign in to your account
            </h2>
        </div>
    );
};
export default SingInHeader;
