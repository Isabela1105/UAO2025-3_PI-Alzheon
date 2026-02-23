// src/components/ui/BotonPrincipal.tsx
import { ButtonHTMLAttributes } from "react";

interface BotonPrincipalProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const BotonPrincipal = ({ label, ...props }: BotonPrincipalProps) => {
  return (
    <button
      {...props}
      className="bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl w-full py-3 transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
};