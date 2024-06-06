import type { NextPage } from 'next';

interface DividerProps {
    label: string;
}
const Divider: NextPage<DividerProps> = ({ label }) => {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">{label}</span>
            </div>
        </div>
    );
};
export default Divider;
