type ResumeCardProps = {
  file: {
    username: string;
    positions: string[];
    filename: string;
    data: string;
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
      <iframe
        src={`data:application/pdf;base64,${file.data}`}
        className="w-full h-36 border-none pointer-events-none rounded-md shadow-sm"
        title={file.filename}
      ></iframe>
      <div className="mt-2 text-gray-800 text-sm font-medium">
        {file.username ?? "Anonymous"}
      </div>
    </div>
  );
};

export default ResumeCard;
