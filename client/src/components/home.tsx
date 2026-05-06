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
import { Progress, Skeleton } from "@mantine/core";
import { CourseInfo } from "../misc/types";
import { Link } from "@tanstack/react-router";

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
    <div className="bg-gray-50">
      <div
        className="relative h-[450px] bg-cover bg-center flex pt-20 justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/50" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-3xl mx-auto w-full">
          <span className="inline-block mb-6 px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase bg-[#d73f09]/20 text-[#ff7a50] border border-[#d73f09]/40 backdrop-blur-sm">
            Oregon State University
          </span>

          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-lg leading-relaxed">
            Course reviews, difficulty ratings, and degree planning - built by
            OSU students, for OSU students.
          </p>

          <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl">
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

      <div className="py-10 px-6 max-w-[1280px] mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d73f09] mb-2">
            Trending
          </p>
          <h2 className="!text-3xl md:!text-4xl !font-black text-gray-900">
            Popular Courses
          </h2>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-start gap-6">
          {isLoading ? (
            <>
              <Skeleton height={280} width={375} radius="lg" />
              <Skeleton height={280} width={375} radius="lg" />
              <Skeleton height={280} width={375} radius="lg" />
            </>
          ) : (
            popularCourses.map((item: PopularCourses) => {
              const [courseNumber, courseTitle] = splitString(
                item.course.course_name,
                "-",
              );
              const isCore = classType(courseNumber) === "Core";

              return (
                <Link
                  key={item.course._id}
                  to="/reviews"
                  onClick={() =>
                    dispatch(setSelectedCourse(item.course.course_name))
                  }
                  className="group no-underline"
                >
                  <div className="relative flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-[355px] md:w-[375px] h-[270px] md:h-[280px] overflow-hidden border border-gray-100">
                    <div
                      className={`h-1 w-full ${isCore ? "bg-[#d73f09]" : "bg-[#f28705]"}`}
                    />
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="!text-base !font-black text-gray-900">
                          {courseNumber}
                        </h3>
                        <span
                          className={`${isCore ? "bg-[#d73f09]" : "bg-[#f28705]"} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}
                        >
                          {classType(courseNumber)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {courseTitle}
                      </p>

                      <p className="text-xs text-gray-500 italic flex-1 line-clamp-2">
                        "{item.course.course_tips.slice(0, 90)}..."
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>Difficulty</span>
                          <span className="font-bold text-gray-800">
                            {item.avg_difficulty.toFixed(1)} / 5
                          </span>
                        </div>
                        <Progress
                          value={item.avg_difficulty * 20}
                          color={isCore ? "#d73f09" : "#f28705"}
                          size="sm"
                          radius="xl"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-3">
                          <span>{item.avg_hours.toFixed(1)} hrs / week</span>
                          <span className="font-semibold">
                            {item.count} Reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-gray-50 py-10 px-6 border-t border-gray-200">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d73f09] mb-2">
              Explore
            </p>
            <h2 className="!text-3xl md:!text-4xl !font-black text-gray-900">
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
                className="group flex flex-col gap-4 bg-white hover:bg-orange-50 border border-gray-200 hover:border-[#d73f09]/40 rounded-2xl p-6 transition-all duration-300 no-underline shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
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
                <div>
                  <h3 className="!text-sm !font-bold text-gray-900 mb-1">
                    {feature.header}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <span className="text-[#d73f09] text-xs font-semibold mt-auto group-hover:underline">
                  Learn more →
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
