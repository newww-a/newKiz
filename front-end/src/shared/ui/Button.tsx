type ButtonProps = {
    label: string;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    selected?: boolean;
};

const Button: React.FC<ButtonProps> = ({label, onClick, className, icon, selected }) => {
    return (
        <button
            className={`px-4 py-2 rounded-md flex items-center  ${
            selected ? 'bg-[#7CBA36] text-white font-extrabold ' : 'bg-white text-[#202020] font-bold'
          } ${className}`}
          onClick={onClick}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
};
export default Button;