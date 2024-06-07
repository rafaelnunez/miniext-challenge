import type { NextPage } from 'next';
import Link from 'next/link';

const ByMe: NextPage = () => {
    return (
        <div className="w-full flex flex-col justify-center">
            <Link
                className="text-violet-500 hover:text-violet-600"
                href="https://miniext-challenge-neon.vercel.app/"
                target="_blank"
            >
                Live Demo Challenge
            </Link>
            By Rafael Nunez Manotas
        </div>
    );
};
export default ByMe;
