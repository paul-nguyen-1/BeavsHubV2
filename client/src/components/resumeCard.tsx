import ReactPDF from "./ReactPDF";

type ResumeCardProps = {
  file: {
    username: string;
    positions: string[];
    filename: string;
    url: string;
  };
  onClick: () => void;
};

const ResumeCard = ({ file, onClick }: ResumeCardProps) => {
  return (
    <div
      onClick={onClick}
      className="border border-gray-300 rounded-lg p-4 cursor-pointer w-48 text-center bg-white transition-shadow duration-300 hover:shadow-lg overflow-hidden"
    >
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {file.positions.map((position) => (
          <div
            key={position}
            className="text-gray-800 text-sm py-1 px-3 rounded-full bg-gray-300 shadow-sm"
          >
            {position}
          </div>
        ))}
      </div>
      <ReactPDF
        file={`${import.meta.env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL}${file.url}`}
      />
      <div className="mt-2 text-gray-800 text-sm font-medium">
        {file.username ?? "Anonymous"}
      </div>
    </div>
  );
};

export default ResumeCard;
