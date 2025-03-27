import { QuickActions } from "./ui/buttons";
import clipboardIcon from "../assets/clipboard-fill.svg";
import calendarIcon from "../assets/calendar-fill.svg";
import telegramIcon from "../assets/telegram-fill.svg";
import peopleIcon from "../assets/people-fill.svg";
import backgroundImage from "../assets/Hero_section_background.jpg";
import { LinearProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import SelectMantine from "./ui/select";
import {
  getAllCourses,
  lowerDivisionOne,
  lowerDivisionTwo,
  upperDivisionOne,
  upperDivisionTwo,
} from "../misc/const";
import { setSelectedCourse } from "../hooks/useCourse";
import { useQuery } from "@tanstack/react-query";
import { splitString } from "../misc/utils";
import { Loader } from "@mantine/core";
import { CourseInfo } from "../misc/types";

interface PopularCourses {
  avg_difficulty: number;
  avg_hours: number;
  count: number;
  course: CourseInfo;
}

function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const handleCourseChange = (value: string | null) => {
    dispatch(setSelectedCourse(value));
  };

  const fetchFrequentCourses = async () => {
    const url = `${getAllCourses}/courses/frequency`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch chart data");
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["frequentCourses"],
    queryFn: fetchFrequentCourses,
  });

  const popularCourses = data?.slice(0, 3) ?? [];
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
          <div className="w-full md:w-56">
            <SelectMantine
              placeHolder="Pick a class"
              value={""}
              onChange={handleCourseChange}
              data={[
                ...lowerDivisionOne,
                ...lowerDivisionTwo,
                ...upperDivisionOne,
                ...upperDivisionTwo,
              ]}
              isPrimarySelector={true}
            />
          </div>
        </div>
      </div>
      <div>
        <h1>Popular Courses</h1>
        <div className="flex justify-center gap-15">
          {isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            popularCourses.map((course: PopularCourses) => {
              const [courseNumber, courseTitle] = splitString(
                course.course.course_name,
                "-"
              );

              return (
                <div
                  key={course.course._id}
                  className="bg-white shadow-lg rounded-lg p-4 w-80 border"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">{courseNumber}</h2>
                    <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                      Core
                    </span>
                  </div>
                  <h3 className="text-md font-semibold mt-2">{courseTitle}</h3>
                  <p className="text-sm text-gray-600 mt-2">Difficulty level</p>
                  <div className="mt-1">
                    <LinearProgress
                      variant="determinate"
                      value={course.avg_difficulty * 20}
                      className="h-1.5 rounded-lg"
                    />
                  </div>
                  <p className="text-sm italic text-gray-700 mt-3">
                    {course.course.course_tips.slice(0, 75)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                    <span>{course.avg_hours.toFixed(2)} hrs</span>
                    <span>{course.count} Reviews</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

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
