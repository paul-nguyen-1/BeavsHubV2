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
import { splitString, truncate } from "../misc/utils";
import { Skeleton } from "@mantine/core";
import { CourseInfo } from "../misc/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { getDifficultyColor } from "./ui/chart";

interface PopularCourses {
  avg_difficulty: number;
  avg_hours: number;
  count: number;
  course: CourseInfo;
}

const stripCoursePrefix = (courseNumber: string) =>
  courseNumber.replace(/^CS\s*/i, "").trim();

const popularChips = [
  "161 - Intro to Computer Science I",
  "225 - Discrete Structures in Computer Science",
  "261 - Data Structures",
  "271 - Computer Architecture & Assembly Language",
  "340 - Introduction to Databases",
];

function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const course = useSelector(
    (state: RootState) => state.useCourse.selectedCourse,
  );

  const handleCourseChange = (value: string | null) => {
    dispatch(setSelectedCourse(value));
  };

  const goToCourse = (courseName: string) => {
    dispatch(setSelectedCourse(courseName));
    navigate({ to: "/reviews" });
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

  const trendingCourses = (data ?? [])
    .filter((item: PopularCourses) => item.course.course_tips?.trim())
    .slice(0, 6);

  const heaviestCourses = [...(data ?? [])]
    .sort((a: PopularCourses, b: PopularCourses) => b.avg_hours - a.avg_hours)
    .slice(0, 6);
  const maxHours = heaviestCourses[0]?.avg_hours || 1;

  const fetchLatestReviews = async () => {
    const url = `${getAllCourses}/courses?page=1&require_text=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch latest reviews");
    return response.json();
  };

  const { data: latestData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["latestReviews"],
    queryFn: fetchLatestReviews,
  });

  const latestReviews = latestData?.slice(0, 4) ?? [];

  return (
    <div className="bg-[#f7f5f0]">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black/[0.06]">
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:pl-16 xl:pl-24 lg:pr-10 py-16 lg:py-20">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 pt-4">
            Oregon State · Computer Science
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.05] tracking-tight max-w-lg">
            Figure out your next class before your friends do
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
            Real difficulty ratings and workload tips from students who've
            actually been through the class.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 w-full max-w-lg sm:border sm:border-gray-300 sm:bg-white">
            <div className="min-w-0 sm:flex-1 border border-gray-300 bg-white sm:border-0 sm:bg-transparent">
              <SelectMantine
                placeHolder="Search a course - CS 161, discrete, capstone"
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
            <button
              onClick={() => navigate({ to: "/reviews" })}
              className="shrink-0 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-6 h-12 sm:h-auto transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-6 text-sm">
            <span className="text-gray-600">Popular right now:</span>
            {popularChips.map((chip) => {
              const [number] = splitString(chip, " - ");
              return (
                <button
                  key={chip}
                  onClick={() => goToCourse(chip)}
                  className="font-mono text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-[#d73f09] hover:decoration-[#d73f09] transition-colors"
                >
                  CS {number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col bg-[#efece2] border-t border-black/[0.06] lg:border-t-0 px-6 sm:px-10 xl:px-14 py-10 lg:py-24 lg:min-h-[420px]">
          <div className="flex items-baseline justify-between mb-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
              Heaviest workload
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              Hrs / wk
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={34} radius="sm" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {heaviestCourses.map((item: PopularCourses) => {
                const [courseNumber, courseTitle] = splitString(
                  item.course.course_name,
                  "-",
                );
                const pct = (item.avg_hours / maxHours) * 100;

                return (
                  <div key={item.course._id}>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <span className="flex items-baseline gap-2 min-w-0">
                        <span className="font-mono font-bold text-gray-900 text-sm shrink-0">
                          CS {stripCoursePrefix(courseNumber)}
                        </span>
                        <span className="text-gray-700 text-sm truncate">
                          {courseTitle.trim()}
                        </span>
                      </span>
                      <span className="font-mono font-bold text-gray-900 text-sm tabular-nums shrink-0">
                        {item.avg_hours.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-300/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/chart"
            className="invisible md:visible mt-8 text-sm text-gray-700 hover:text-gray-900 transition-colors underline"
          >
            See the full difficulty chart
          </Link>
        </div>
      </div>

      {/* Trending courses */}
      <div className="py-20 px-6 sm:px-10 lg:px-18">
        <div className="flex items-end justify-between pb-4 mb-8 border-b border-gray-300 sm:pb-0 sm:border-0">
          <h2 className="text-3xl font-bold text-gray-900">
            Trending courses
          </h2>
          <Link
            to="/courses"
            className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 hover:decoration-gray-900 transition-colors"
          >
            All {data?.length ?? 0}
            <span className="hidden sm:inline"> courses</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={72} radius="sm" />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="hidden sm:grid sm:grid-cols-[90px_1fr_110px_100px_100px] sm:gap-4 pb-3 border-b border-gray-300 font-mono text-[11px] uppercase tracking-widest text-gray-500">
              <span>Course</span>
              <span>Title</span>
              <span className="text-right">Difficulty</span>
              <span className="text-right">Hrs / wk</span>
              <span className="text-right">Reviews</span>
            </div>
            {trendingCourses.map((item: PopularCourses) => {
              const [courseNumber, courseTitle] = splitString(
                item.course.course_name,
                "-",
              );
              const diffColor = getDifficultyColor(item.avg_difficulty);

              return (
                <Link
                  key={item.course._id}
                  to="/reviews"
                  onClick={() =>
                    dispatch(setSelectedCourse(item.course.course_name))
                  }
                  className="block no-underline group border-b border-gray-200"
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden py-5">
                    <div className="flex items-baseline gap-2 mb-1.5 min-w-0">
                      <span className="font-mono font-bold text-gray-900 text-base shrink-0">
                        CS {stripCoursePrefix(courseNumber)}
                      </span>
                      <span className="font-bold text-gray-900 truncate group-hover:text-[#d73f09] transition-colors">
                        {courseTitle.trim()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {truncate(item.course.course_tips, 300)}
                    </p>
                    <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-gray-500">
                      <span>
                        Diff{" "}
                        <span
                          className="font-bold tabular-nums"
                          style={{ color: diffColor }}
                        >
                          {item.avg_difficulty.toFixed(1)}
                        </span>
                      </span>
                      <span>
                        Hrs{" "}
                        <span className="font-bold text-gray-800 tabular-nums">
                          {item.avg_hours.toFixed(1)}
                        </span>
                      </span>
                      <span>{item.count} Reviews</span>
                    </div>
                  </div>

                  {/* Tablet / desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-[90px_1fr_110px_100px_100px] gap-4 items-baseline py-5">
                    <span className="font-mono font-bold text-gray-900 text-base">
                      CS {stripCoursePrefix(courseNumber)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-gray-900 group-hover:text-[#d73f09] transition-colors">
                        {courseTitle.trim()}
                      </span>
                      <span className="block text-sm text-gray-600 mt-0.5">
                        {truncate(item.course.course_tips, 300)}
                      </span>
                    </span>
                    <span
                      className="text-right font-bold font-mono tabular-nums"
                      style={{ color: diffColor }}
                    >
                      {item.avg_difficulty.toFixed(1)}
                    </span>
                    <span className="text-right font-bold font-mono tabular-nums text-gray-800">
                      {item.avg_hours.toFixed(1)}
                    </span>
                    <span className="text-right font-mono tabular-nums text-gray-600">
                      {item.count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Latest from students */}
      <div className="pb-20 px-6 sm:px-10 lg:px-18">
        <h2 className="text-3xl font-bold text-gray-900 pb-4 border-b border-gray-300 mb-8">
          Latest from students
        </h2>

        {isLoadingLatest ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={90} radius="sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {latestReviews.map((item: CourseInfo) => {
              const [courseNumber] = splitString(item.course_name, "-");
              const metaParts = [
                `CS ${stripCoursePrefix(courseNumber)}`,
                item.course_taken_date || null,
                Number(item.course_difficulty) > 0
                  ? `${Number(item.course_difficulty).toFixed(1)} difficulty`
                  : null,
              ].filter(Boolean);

              return (
                <div key={item._id} className="pb-8 border-b border-gray-200">
                  <p className="text-sm text-gray-800 leading-relaxed mb-3">
                    {item.course_tips
                      ? truncate(item.course_tips, 300)
                      : "No comments were submitted for this post."}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-widest text-gray-600">
                    {metaParts.join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
