import { QuickActions } from "./ui/buttons";
import clipboardIcon from "../assets/clipboard-fill.svg";
import calendarIcon from "../assets/calendar-fill.svg";
import telegramIcon from "../assets/telegram-fill.svg";
import peopleIcon from "../assets/people-fill.svg";
import backgroundImage from "../assets/Hero_section_background.jpg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
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
import { classType, splitString } from "../misc/utils";
import { Loader, Progress } from "@mantine/core";
import { CourseInfo } from "../misc/types";
import { Link } from "@tanstack/react-router";

interface PopularCourses {
  avg_difficulty: number;
  avg_hours: number;
  count: number;
  course: CourseInfo;
}

function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const course = useSelector(
    (state: RootState) => state.useCourse.selectedCourse
  );
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
        <div className="flex flex-col items-center max-w-144 relative bottom-15">
          <h1 className="text-4xl font-bold">Welcome to BeavsHub</h1>
          <div className="flex flex-col gap-8 justify-center items-center">
            <h2 className="text-2xl text-center">
              Comprehensive Course Reviews (2000+) and Degree Planning for OSU
              Students
            </h2>
            <div className="w-64 md:w-122">
              <SelectMantine
                placeHolder="Search for a Course"
                value={course}
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
      </div>
      <div className="flex flex-col items-center">
        <div className="pb-15">
          <h1 className="relative text-center lg:text-left">Popular Courses</h1>
          <div className="flex justify-center flex-wrap gap-15">
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
                  <Link
                    key={course.course._id}
                    to="/courses"
                    onClick={() =>
                      dispatch(setSelectedCourse(course.course.course_name))
                    }
                  >
                    <div className="flex flex-wrap flex-col justify-evenly bg-white drop-shadow-lg hover:opacity-65 rounded-lg p-4 w-[355px] md:w-[375px] h-[280px]">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">{courseNumber}</h2>
                        <span
                          className={`${
                            classType(courseNumber) === "Core"
                              ? "bg-[#d73f09]"
                              : "bg-[#f28705]"
                          } text-white text-xs px-3 py-1 rounded-full w-16 flex justify-center`}
                        >
                          {classType(courseNumber)}
                        </span>
                      </div>
                      <h3 className="text-md mt-2">{courseTitle}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Difficulty level
                      </p>
                      <div className="mt-1">
                        <Progress
                          variant="determinate"
                          value={course.avg_difficulty * 20}
                          className="h-1.5 rounded-lg"
                          color="#d73f09"
                        />
                      </div>
                      <p className="text-sm italic text-gray-700 mt-3">
                        {course.course.course_tips.slice(0, 75)}...
                      </p>
                      <div className="flex flex-row justify-between items-center text-sm text-gray-600 mt-4">
                        <span>{course.avg_hours.toFixed(2)} hrs / wk</span>
                        <span>{course.count} Reviews</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
        <div className="w-full bg-white pt-1 pb-15">
          <div className="w-full max-w-[1280px] mx-auto px-4">
            <h1 className="relative text-center md:text-left mb-6">
              Quick Actions
            </h1>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10">
              <QuickActions
                image={calendarIcon}
                alt="Degree Path"
                header="Degree Path"
                link="https://catalog.oregonstate.edu/courses/cs/"
              />
              <QuickActions
                image={telegramIcon}
                alt="Request Information"
                header="Request Information"
                link="mailto:eecs@oregonstate.edu"
              />
              <QuickActions
                image={clipboardIcon}
                alt="Program Details"
                header="Program Details"
                link="https://engineering.oregonstate.edu/EECS"
              />
              <QuickActions
                image={peopleIcon}
                alt="Discord"
                header="Discord"
                link="https://discord.gg/v5cFyqm4JY"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
