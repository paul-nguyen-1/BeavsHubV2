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
import { Skeleton } from "@mantine/core";
import { CourseInfo } from "../misc/types";
import { Link } from "@tanstack/react-router";
import { getDifficultyColor } from "./ui/chart";

interface PopularCourses {
  avg_difficulty: number;
  avg_hours: number;
  count: number;
  course: CourseInfo;
}

const features = [
  {
    image: clipboardIcon,
    alt: "Program Details",
    header: "Program Details",
    description: "Explore the full CS curriculum and program requirements.",
    link: "https://engineering.oregonstate.edu/EECS",
  },
  {
    image: calendarIcon,
    alt: "Degree Path",
    header: "Degree Path",
    description: "Plan your journey with the official OSU course catalog.",
    link: "https://catalog.oregonstate.edu/courses/cs/",
  },
  {
    image: telegramIcon,
    alt: "Contact",
    header: "Request Information",
    description: "Reach out to the EECS department directly with questions.",
    link: "mailto:eecs@oregonstate.edu",
  },
  {
    image: peopleIcon,
    alt: "Discord",
    header: "Join Discord",
    description: "Connect with fellow OSU CS students in the community.",
    link: "https://discord.gg/v5cFyqm4JY",
  },
];

function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const course = useSelector(
    (state: RootState) => state.useCourse.selectedCourse,
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
    <div>
      {/* Hero */}
      <div
        className="relative overflow-hidden h-[520px] bg-cover bg-center flex justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#fafafa]" />

        <div
          className="floating-orb"
          style={{
            width: 420,
            height: 420,
            top: -110,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#d73f09",
            opacity: 0.22,
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-3xl mx-auto w-full pt-24">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-[1.05] tracking-tight">
            Figure out your next class
            <br />
            before your <span className="text-[#ff7a50]">friends</span> do
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed">
            Real difficulty ratings and workload tips from students who've
            actually sat through the class.
          </p>

          <div className="w-full max-w-lg glass rounded-2xl p-1.5">
            <SelectMantine
              placeHolder="Search for a course (e.g. CS 161)"
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

      <div className="bg-[#fafafa]">
        {/* Popular courses */}
        <div className="py-20 px-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#d73f09] mb-2">
                Trending
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Popular courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-sm font-medium text-gray-400 hover:text-gray-900 no-underline transition-colors sm:mb-1"
            >
              Browse all
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Skeleton height={230} radius="lg" />
              <Skeleton height={230} radius="lg" />
              <Skeleton height={230} radius="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {popularCourses.map((item: PopularCourses) => {
                const [courseNumber, courseTitle] = splitString(
                  item.course.course_name,
                  "-",
                );
                const isCore = classType(courseNumber) === "Core";
                const diffColor = getDifficultyColor(item.avg_difficulty);

                return (
                  <Link
                    key={item.course._id}
                    to="/reviews"
                    onClick={() =>
                      dispatch(setSelectedCourse(item.course.course_name))
                    }
                    className="group no-underline flex"
                  >
                    <div className="flex flex-col w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                      <div
                        className="h-[3px] w-full"
                        style={{ backgroundColor: diffColor }}
                      />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-mono text-lg font-bold text-gray-900 tracking-tight">
                            {courseNumber}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isCore ? "text-[#d73f09]" : "text-[#b25a00]"
                            }`}
                          >
                            {classType(courseNumber)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-3">
                          {courseTitle}
                        </p>
                        <p className="text-sm text-gray-400 italic leading-relaxed line-clamp-2 flex-1">
                          "{item.course.course_tips}"
                        </p>

                        <div className="grid grid-cols-3 mt-5 pt-4 border-t border-gray-100">
                          <div>
                            <div
                              className="text-sm font-bold tabular-nums"
                              style={{ color: diffColor }}
                            >
                              {item.avg_difficulty.toFixed(1)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">
                              Difficulty
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800 tabular-nums">
                              {item.avg_hours.toFixed(1)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">
                              Hrs / wk
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800 tabular-nums">
                              {item.count}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">
                              Reviews
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Beyond reviews */}
        <div className="pb-20 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d73f09] mb-2">
              Explore
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Everything You Need
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Resources, community, and tools to help you succeed in your CS
              degree at OSU.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <a
                key={feature.header}
                href={feature.link}
                target={feature.link.startsWith("http") ? "_blank" : undefined}
                rel={
                  feature.link.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 no-underline"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="w-5 h-5"
                    style={{
                      filter:
                        "invert(28%) sepia(85%) saturate(1200%) hue-rotate(3deg) brightness(90%)",
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                    {feature.header}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#d73f09] inline-flex items-center gap-1">
                  Learn more
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
