interface FilterChipButtonProps {
  label: string;
  filterType: string;
  isActive?: boolean;
  onClick?: (filterType: string) => void;
}

const FilterChipButton = ({ label, filterType, isActive = false, onClick }: FilterChipButtonProps) => {
  return (
    <button
      onClick={() => onClick?.(filterType)}
      className={`shrink-0 px-4 py-2 rounded-full shadow text-sm font-medium transition-colors ${
        isActive
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
};

export default FilterChipButton;
