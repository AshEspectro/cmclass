

interface ViewMoreButtonProps<T> {
  data: T[];                // The data array to check
  limit: number;            // Threshold for showing the button
  onClick: () => void;      // Action when button is clicked
  className?: string;       // Optional styling
}

export const ViewMoreButton = <T,>({
  data,
  limit,
  onClick,
  className,
}: ViewMoreButtonProps<T>) => {
  if (!data || data.length <= limit) return null; // hide if below limit

  return (
    <div className={`text-center mt-4 ${className || ""}`}>
      <button
        onClick={onClick}
        className="px-6 py-2 border border-black rounded hover:bg-black hover:text-white transition"
      >
        View More
      </button>
    </div>
  );
};
