type ResumeCardProps = {
  file: {
    filename: string;
    data: string;
  };
  onClick: () => void;
};

const ResumeCard = ({ file, onClick }: ResumeCardProps) => {
  return (
    <div
      onClick={onClick}
      className="border border-black rounded-lg p-4 cursor-pointer w-48 text-center bg-white transition-shadow duration-300 hover:shadow-md overflow-hidden"
    >
      <h3 className="text-lg font-medium mb-3">Intern</h3>
      <iframe
        src={`data:application/pdf;base64,${file.data}`}
        className="w-full h-36 border-none pointer-events-none"
        title={file.filename}
      ></iframe>
      <div>Card User</div>
    </div>
  );
};

export default ResumeCard;
