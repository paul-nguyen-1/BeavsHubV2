import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  difficultyList,
  getAllCourses,
  lowerDivisionOne,
  lowerDivisionTwo,
  sortedTimeSpent,
  upperDivisionOne,
  upperDivisionTwo,
} from "../misc/const";
import { CourseInfo } from "../misc/types";
import { Course } from "./course";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Loader,
  Modal,
  MultiSelect,
  Select,
  Skeleton,
  Textarea,
} from "@mantine/core";
import { motion } from "framer-motion";
import SelectMantine from "./ui/select";
import { MantineInput } from "./ui/input";
import {
  BarChartMantine,
  PieChartMantine,
  DonutChartMantine,
} from "./ui/chart";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { setSelectedDifficulty } from "../hooks/useDifficulty";
import { setSelectedHours } from "../hooks/useHours";
import { classType } from "../misc/utils";

interface CourseFormData {
  course_name: string;
  course_difficulty: string;
  course_time_spent_per_week: string;
  course_enjoyability: string;
  course_tips: string;
  course_taken_date: string;
  pairs: string[];
}

function Courses() {
  const dispatch = useDispatch<AppDispatch>();
  const course = useSelector(
    (state: RootState) => state.useCourse.selectedCourse
  );
  const difficulty = useSelector(
    (state: RootState) => state.useDifficulty.selectedDifficulty
  );
  const timeSpent = useSelector(
    (state: RootState) => state.useHours.selectedHours
  );

  const [date, setDate] = useState<string | null>("");
  const [review, setReview] = useState<string | null>("");
  const [debouncedCourse] = useDebouncedValue(course, 200);
  const [debouncedReview] = useDebouncedValue(review, 200);
  const [opened, { open, close }] = useDisclosure(false);
  const [filterOpened, { open: openFilter, close: closeFilter }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    course_name: "",
    course_difficulty: "",
    course_time_spent_per_week: "",
    course_tips: "",
    course_enjoyability: "",
    course_taken_date: "",
    pairs: [],
  });

  const { ref, inView } = useInView();

  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const params = new URLSearchParams({ page: pageParam.toString() });
    if (date) params.append("date", date);
    if (debouncedReview) params.append("course_tips", debouncedReview);
    if (difficulty) params.append("difficulty", difficulty);
    if (timeSpent) params.append("time_spent", timeSpent);
    if (course === "419 (Legacy)/467 - Capstone")
      dispatch(setSelectedCourse("Capstone"));
    const url = debouncedCourse
      ? `${getAllCourses}/courses/${debouncedCourse.split(" - ")[0]}?${params.toString()}`
      : `${getAllCourses}/courses?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch courses data");
    return response.json();
  };

  const {
    data,
    isLoading: isLoadingCourses,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [
      "projects",
      debouncedCourse,
      debouncedReview,
      date,
      difficulty,
      timeSpent,
    ],
    queryFn: fetchProjects,
    initialPageParam: 1,
    getNextPageParam: (_lastPage, pages) => pages.length + 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "error") alert("Error: " + error.message);

  const fetchChartData = async () => {
    const params = new URLSearchParams();
    if (debouncedReview) params.append("course_tips", debouncedReview);
    if (date) params.append("date", date);
    if (difficulty) params.append("difficulty", difficulty);
    if (timeSpent) params.append("time_spent", timeSpent);
    const encodedCourse = debouncedCourse
      ? encodeURIComponent(debouncedCourse)
      : "";
    let url = debouncedCourse
      ? `${getAllCourses}/courses/${encodedCourse}/all_reviews?${params.toString()}`
      : `${getAllCourses}/courses/all?${params.toString()}`;
    url = url.replace(/\+/g, "%20");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch chart data");
    return response.json();
  };

  const {
    data: fetchedChartData,
    isLoading: isChartLoading,
    error: chartError,
  } = useQuery({
    queryKey: [
      "chartData",
      debouncedCourse,
      debouncedReview,
      date,
      difficulty,
      timeSpent,
    ],
    queryFn: fetchChartData,
  });

  if (chartError) console.log("Chart Error: " + chartError.message);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const handleCourseChange = (value: string | null) =>
    dispatch(setSelectedCourse(value));
  const handleDateChange = (value: string | null) => setDate(value);
  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setReview(e.target.value);
  const handleDifficultyChange = (value: string | null) =>
    dispatch(setSelectedDifficulty(value));
  const handleTimeSpentChange = (value: string | null) =>
    dispatch(setSelectedHours(value));
  const handleCourseInputChange = (name: string, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [name]: value }));
  const handleCourseSubmit = () => mutation.mutate(formData);
  const handleClearFilter = () => {
    dispatch(setSelectedCourse(""));
    setReview("");
    setDate("");
    dispatch(setSelectedDifficulty(""));
    dispatch(setSelectedHours(""));
    closeFilter();
  };

  const queryClient = useQueryClient();

  const mutation = useMutation<Response, Error, CourseFormData>({
    mutationFn: (formData: CourseFormData) =>
      fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create course");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["chartData", course, review] });
      close();
      setFormData({
        course_name: "",
        course_difficulty: "",
        course_time_spent_per_week: "",
        course_tips: "",
        course_enjoyability: "",
        course_taken_date: "",
        pairs: [],
      });
    },
    onError: () => alert("Error creating course. Please try again."),
  });

  const reviewCount = data?.pages.reduce((n, page) => n + page.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">

        <Drawer
          opened={filterOpened}
          onClose={closeFilter}
          title={<span className="font-black text-gray-900">Filters</span>}
          position="right"
          size="sm"
        >
          <div className="flex flex-col gap-5 pt-2">
            <SelectMantine
              label="Course"
              placeHolder="Pick a class"
              value={course}
              onChange={handleCourseChange}
              data={[
                ...lowerDivisionOne,
                ...lowerDivisionTwo,
                ...upperDivisionOne,
                ...upperDivisionTwo,
              ]}
            />
            <MantineInput
              label="Review Text"
              value={review ?? ""}
              onChange={handleReviewChange}
              placeholder="Search for a review"
            />
            <SelectMantine
              label="Difficulty"
              placeHolder="Search Difficulty"
              value={difficulty ?? ""}
              onChange={handleDifficultyChange}
              data={[...difficultyList]}
            />
            <SelectMantine
              label="Time Spent"
              placeHolder="Search Time Spent"
              value={timeSpent ?? ""}
              onChange={handleTimeSpentChange}
              data={[...sortedTimeSpent]}
            />
            <SelectMantine
              label="Date Range"
              placeHolder="Filter Date"
              value={date}
              data={["1 Month", "3 Months", "6 Months", "1 Year", "2 Years"]}
              onChange={handleDateChange}
            />
            <Button variant="default" onClick={handleClearFilter}>
              Clear Filters
            </Button>
          </div>
        </Drawer>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-gray-900">
                {course
                  ? course.includes("Capstone")
                    ? "Capstone"
                    : course
                  : "Browse All Reviews"}
              </span>
              {course && (
                <span
                  className={`${
                    classType(course) === "Core" ? "bg-[#d73f09]" : "bg-[#f28705]"
                  } text-white text-xs px-2.5 py-1 rounded-full font-semibold`}
                >
                  {classType(course)}
                </span>
              )}
            </div>
            {data && fetchedChartData && (
              <p className="text-sm text-gray-400 mt-0.5">
                {reviewCount} of {fetchedChartData.length} reviews
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={openFilter}>
              Filters
            </Button>
            <Button size="sm" color="#d73f09" onClick={open}>
              New Post
            </Button>
          </div>
        </div>

        <Modal opened={opened} onClose={close} title="Create New Course Review">
          <div className="flex flex-col gap-4">
            <Select
              value={formData.course_name}
              onChange={(v) => handleCourseInputChange("course_name", v ?? "")}
              label="Course Name"
              placeholder="Select Course Name"
              data={[
                ...lowerDivisionOne,
                ...lowerDivisionTwo,
                ...upperDivisionOne,
                ...upperDivisionTwo,
              ]}
              clearable
            />
            <Select
              label="Course Difficulty (1-5)"
              placeholder="Enter Course Difficulty"
              data={["1", " 2", "3", "4", "5"]}
              value={formData.course_difficulty}
              onChange={(v) => {
                const n = Number(v);
                if (!isNaN(n))
                  handleCourseInputChange("course_difficulty", n.toString());
              }}
              clearable
            />
            <Select
              label="Time Spent Per Week"
              placeholder="E.g., 0-5 hours"
              data={["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"]}
              value={formData.course_time_spent_per_week}
              onChange={(v) =>
                handleCourseInputChange("course_time_spent_per_week", v ?? "")
              }
            />
            <Select
              value={formData.course_enjoyability}
              onChange={(v) =>
                handleCourseInputChange("course_enjoyability", v ?? "")
              }
              label="Course Enjoyability"
              placeholder="Select Course Enjoyability"
              data={["Enjoyable", "Neutral", "Not Enjoyable"]}
              clearable
            />
            <Textarea
              placeholder="Enter Tips for the Course"
              label="Course Tips"
              autosize
              minRows={2}
              value={formData.course_tips}
              onChange={(e) =>
                handleCourseInputChange("course_tips", e.target.value)
              }
            />
            <div className="flex gap-4 w-full">
              <Select
                className="w-full"
                label="Course Taken Date"
                placeholder="Select term"
                data={["Spring", "Summer", "Winter", "Fall"]}
                value={formData.course_taken_date.split(" ")[0] || ""}
                onChange={(season) =>
                  handleCourseInputChange(
                    "course_taken_date",
                    `${season} ${formData.course_taken_date.split(" ")[1] || ""}`.trim()
                  )
                }
                clearable
              />
              <MantineInput
                label="Year"
                placeholder="E.g., 2025"
                value={formData.course_taken_date.split(" ")[1] || ""}
                onChange={(e) => {
                  const year = e.target.value.slice(0, 4);
                  handleCourseInputChange(
                    "course_taken_date",
                    `${formData.course_taken_date.split(" ")[0] || ""} ${year}`.trim()
                  );
                }}
              />
            </div>
            <MultiSelect
              label="Course Pairs"
              placeholder="Pick one or more courses"
              data={[
                ...lowerDivisionOne,
                ...lowerDivisionTwo,
                ...upperDivisionOne,
                ...upperDivisionTwo,
              ]}
              value={formData.pairs}
              onChange={(selected) =>
                handleCourseInputChange("pairs", selected)
              }
              clearable
              required
            />
          </div>
          <div className="mt-4">
            <Button color="#d73f09" onClick={handleCourseSubmit}>
              Submit
            </Button>
          </div>
        </Modal>

        <div className="flex flex-col md:flex-row gap-5">

          <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <p className="font-bold text-gray-900 text-sm">Course Statistics</p>
            <div className="flex flex-col md:flex-row gap-4">
              <PieChartMantine data={fetchedChartData} isLoading={isChartLoading} />
              <DonutChartMantine data={fetchedChartData} isLoading={isChartLoading} />
            </div>
            <BarChartMantine data={fetchedChartData} isLoading={isChartLoading} />
          </div>

          <motion.div
            className="flex-1 min-w-0"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div
              className={`flex flex-col gap-3 overflow-y-auto no-scrollbar md:max-h-[72vh] ${
                status === "pending" ? "opacity-60" : ""
              }`}
            >
              {status === "pending" && (
                <>
                  <Skeleton height={180} radius="lg" />
                  <Skeleton height={180} radius="lg" />
                  <Skeleton height={180} radius="lg" />
                </>
              )}

              {data?.pages.map((page, pageIndex) =>
                page.map((courseItem: CourseInfo) => (
                  <Skeleton
                    visible={isLoadingCourses}
                    key={`${pageIndex}-${courseItem._id}`}
                    radius="lg"
                  >
                    <motion.div variants={itemVariants}>
                      <Course
                        key={`${pageIndex}-${courseItem._id}`}
                        difficulty={courseItem.course_difficulty}
                        course={courseItem.course_name}
                        taken_date={courseItem.course_taken_date}
                        enjoyability={courseItem.course_enjoyability}
                        time_spent_per_week={courseItem.course_time_spent_per_week}
                        timestamp={new Date(courseItem.timestamp).toLocaleString()}
                        tips={courseItem.course_tips}
                        pairs={courseItem.pairs}
                      />
                    </motion.div>
                  </Skeleton>
                ))
              )}

              {hasNextPage &&
                data &&
                fetchedChartData?.length > data.pages.length * 10 && (
                  <div ref={ref} className="py-4 flex justify-center">
                    {isFetchingNextPage && <Loader size="sm" />}
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
