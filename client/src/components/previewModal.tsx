type ResumeModalProps = {
  file: {
    companies: string[];
    filename: string;
    data: string;
  };
  onClose: () => void;
};

const ResumeModal: React.FC<ResumeModalProps> = ({ file, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-5 w-11/12 h-5/6 flex relative">
        <div className="flex-[2] mr-2">
          <iframe
            src={`data:application/pdf;base64,${file.data}#toolbar=0&zoom=page-fit`}
            title={file.filename}
            className="w-full h-full border-none rounded-lg"
          ></iframe>
        </div>
        <div className="flex-1 bg-gray-100 rounded-lg p-5 overflow-y-auto flex flex-col">
          <h3 className="text-lg font-bold">User</h3>
          <div>
            <p>Passed Resume Screens</p>
            <hr />
            {file.companies.length > 0 ? (
              file.companies.map((company, index) => (
                <div key={index}>{company}</div>
              ))
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="self-end bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
