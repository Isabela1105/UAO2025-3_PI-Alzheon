// src/components/ui/Textbox.tsx
import { InputHTMLAttributes } from "react";

interface TextboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Textbox = ({ label, ...props }: TextboxProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-gray-700 text-sm font-medium">{label}</label>
      )}
      <input
        {...props}
        className="border border-gray-300 focus:border-[#0066FF] rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm"
      />
    </div>
  );
};