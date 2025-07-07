import ReactPDF from "./ReactPDF";

type ResumeModalProps = {
  file: {
    positions: string[];
    companies: string[];
    filename: string;
    url: string;
  };
  onClose: () => void;
};

const ResumeModal: React.FC<ResumeModalProps> = ({ file, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-wrap justify-center items-center overflow-auto z-50">
      <div className="bg-white p-5 rounded-lg flex flex-col md:flex-row relative md:overflow-hidden gap-4">
        <div className="md:w-3/5">
          <div>
            <ReactPDF
              file={`${import.meta.env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL}${file.url}`}
            />
          </div>
        </div>
        <div className=" bg-gray-200 rounded-lg p-6 overflow-y-auto flex flex-col shadow-lg">
          <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Positions Applied For:
            </h3>
            {file.positions.map((position, index) => (
              <h2
                key={index}
                className="text-gray-800 text-sm py-1 px-3 rounded-full bg-gray-300 shadow-sm"
              >
                {position}
              </h2>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-gray-800 font-semibold text-lg">
              Passed Resume Screens
            </p>
            <hr className="border-gray-300 my-3" />
            <div className="h-full md:w-3/5 flex justify-between flex-col">
              {file.companies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {file.companies.map((company, index) => (
                    <div
                      key={index}
                      className="text-gray-700 text-sm py-1 px-3 rounded-full bg-white shadow-md"
                    >
                      {company}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No companies listed</p>
              )}
            </div>
          </div>
              <button
                onClick={onClose}
                className="self-end bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 md:mt-auto shadow-md mt-12 cursor-pointer"
              >
                Close
              </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
