import { QuickActions } from "./ui/buttons";
import clipboardIcon from "../assets/clipboard-fill.svg";
import calendarIcon from "../assets/calendar-fill.svg";
import telegramIcon from "../assets/telegram-fill.svg";
import peopleIcon from "../assets/people-fill.svg";
import backgroundImage from "../assets/Hero_section_background.jpg";
import { LinearProgress } from "@mui/material";

function Home() {
  return (
    <>
      <div
        className="h-[550px] bg-cover bg-center flex flex-col items-center justify-center text-white"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="relative bottom-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold">Welcome to BeavsHub</h1>
          <h2 className="text-2xl mt-2">
            Comprehensive Course Reviews and Degree Planning for OSU Students
          </h2>
        </div>
      </div>
      <div>
        <h1>Popular Courses</h1>
        <div className="flex justify-center gap-15">
          <div className="bg-white shadow-lg rounded-lg p-4 w-80 border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">CS 225</h2>
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                Core
              </span>
            </div>
            <h3 className="text-md font-semibold mt-2">
              Discrete Structures in Computer Science
            </h3>
            <p className="text-sm text-gray-600 mt-2">Difficulty level</p>
            <div className="mt-1">
              <LinearProgress
                variant="determinate"
                value={35}
                className="h-1.5 rounded-lg"
              />
            </div>
            <p className="text-sm italic text-gray-700 mt-3">
              “This course is difficult, but once you get on a roll in the class
              it starts to get easier.”
            </p>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
              <span>Avg. 6-12 hrs</span>
              <span>223 Reviews</span>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 w-80 border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">CS 225</h2>
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                Core
              </span>
            </div>
            <h3 className="text-md font-semibold mt-2">
              Discrete Structures in Computer Science
            </h3>
            <p className="text-sm text-gray-600 mt-2">Difficulty level</p>
            <div className="mt-1">
              <LinearProgress
                variant="determinate"
                value={35}
                className="h-1.5 rounded-lg"
              />
            </div>
            <p className="text-sm italic text-gray-700 mt-3">
              “This course is difficult, but once you get on a roll in the class
              it starts to get easier.”
            </p>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
              <span>Avg. 6-12 hrs</span>
              <span>223 Reviews</span>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 w-80 border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">CS 225</h2>
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                Core
              </span>
            </div>
            <h3 className="text-md font-semibold mt-2">
              Discrete Structures in Computer Science
            </h3>
            <p className="text-sm text-gray-600 mt-2">Difficulty level</p>
            <div className="mt-1">
              <LinearProgress
                variant="determinate"
                value={35}
                className="h-1.5 rounded-lg"
              />
            </div>
            <p className="text-sm italic text-gray-700 mt-3">
              “This course is difficult, but once you get on a roll in the class
              it starts to get easier.”
            </p>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
              <span>Avg. 6-12 hrs</span>
              <span>223 Reviews</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h1>Quick Actions</h1>

        <div className="flex flex-wrap justify-center gap-10">
          <QuickActions
            image={calendarIcon}
            alt="Degree Path"
            header="Degree Path"
          />
          <QuickActions
            image={telegramIcon}
            alt="Request Information"
            header="Request Information"
          />
          <QuickActions
            image={clipboardIcon}
            alt="Program Details"
            header="Program Details"
          />
          <QuickActions image={peopleIcon} alt="Discord" header="Discord" />
        </div>
      </div>
    </>
  );
}

export default Home;
