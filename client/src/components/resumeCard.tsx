import { Avatar } from "@mantine/core";
import ReactPDF from "./ReactPDF";
import user from "../assets/Profile_icon_fill.svg";

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
      <div className="flex flex-wrap gap-2 justify-end mb-3">
        {file.positions.map((position) => (
          <div
            key={position}
            className="text-sm py-1 px-1.5 rounded-full bg-[#d73f09] text-white shadow-sm"
          >
            {position}
          </div>
        ))}
      </div>
      <ReactPDF
        file={`${import.meta.env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL}${file.url}`}
        isCardPDF={true}
      />
      <div className="flex flex-row gap-2 relative top-2">
        <Avatar
          src={user}
          alt="Avatar"
          radius="xl"
        />
        <div className="mt-2 text-gray-800 text-sm font-medium">
          {file.username ?? "Anonymous"}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
