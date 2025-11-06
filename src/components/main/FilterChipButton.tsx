import React from "react";

interface FilterChipButtonProps {
  label: string;
  filterType: string;
  isActive?: boolean;
  onClick?: (filterType: string) => void;
  icon?: string | React.ElementType;
}

const FilterChipButton = ({ label, filterType, isActive = false, onClick, icon }: FilterChipButtonProps) => {
  const iconClassName = `w-4 h-4 ${isActive ? "brightness-0 invert" : ""}`;

  return (
    <button
      onClick={() => onClick?.(filterType)}
      className={`shrink-0 px-4 py-2 rounded-full shadow text-sm font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon && typeof icon === "string" ? (
        <img src={icon} alt="" className={iconClassName} />
      ) : (
        icon && React.createElement(icon, { className: iconClassName })
      )}
      {label}
    </button>
  );
};

export default FilterChipButton;
