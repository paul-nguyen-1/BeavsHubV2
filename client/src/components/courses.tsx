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
import { ReviewStats } from "./reviewStats";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
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
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import SelectMantine from "./ui/select";
import { MantineInput } from "./ui/input";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { setSelectedDifficulty } from "../hooks/useDifficulty";
import { setSelectedHours } from "../hooks/useHours";
import { classType } from "../misc/utils";

const getFieldClassNames = (hasError?: boolean) => ({
  label:
    "!font-mono !text-[11px] !font-bold !uppercase !tracking-widest !text-gray-500 !mb-1.5",
  input: `!rounded-none !border !text-gray-900 !shadow-none ${
    hasError
      ? "!border-red-500 focus:!border-red-500"
      : "!border-gray-300 focus:!border-gray-900"
  }`,
  error: "!text-red-600 !text-xs !mt-1",
  dropdown: "!rounded-none !border !border-gray-900 !shadow-lg",
  option:
    "!rounded-none data-[combobox-selected]:!bg-[#d73f09] data-[combobox-selected]:!text-white hover:!bg-orange-50",
  pill: "!rounded-none !bg-gray-900 !text-white",
});

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
  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);
  const [formData, setFormData] = useState({
    course_name: "",
    course_difficulty: "",
    course_time_spent_per_week: "",
    course_tips: "",
    course_enjoyability: "",
    course_taken_date: "",
    pairs: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const courseNameRef = useRef<HTMLInputElement>(null);
  const difficultyRef = useRef<HTMLInputElement>(null);
  const timeSpentRef = useRef<HTMLInputElement>(null);
  const tipsRef = useRef<HTMLTextAreaElement>(null);
  const takenDateRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView();

  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const params = new URLSearchParams({ page: pageParam.toString() });
    if (date) params.append("date", date);
    if (debouncedReview) params.append("course_tips", debouncedReview);
    if (difficulty) params.append("difficulty", difficulty);
    if (timeSpent) params.append("time_spent", timeSpent);
    const url = debouncedCourse
      ? `${getAllCourses}/courses/${encodeURIComponent(debouncedCourse.split(" - ")[0])}?${params.toString()}`
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
  const handleCourseInputChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleCourseSubmit = () => {
    const [takenSeason, takenYear] = formData.course_taken_date.split(" ");
    const requiredFields: {
      key: string;
      label: string;
      valid: boolean;
      ref: React.RefObject<HTMLElement>;
    }[] = [
      {
        key: "course_name",
        label: "a course name",
        valid: Boolean(formData.course_name),
        ref: courseNameRef,
      },
      {
        key: "course_difficulty",
        label: "a difficulty rating",
        valid: Boolean(formData.course_difficulty),
        ref: difficultyRef,
      },
      {
        key: "course_time_spent_per_week",
        label: "time spent per week",
        valid: Boolean(formData.course_time_spent_per_week),
        ref: timeSpentRef,
      },
      {
        key: "course_tips",
        label: "course tips",
        valid: Boolean(formData.course_tips.trim()),
        ref: tipsRef,
      },
      {
        key: "course_taken_date",
        label: "the term and year taken",
        valid: Boolean(takenSeason) && Boolean(takenYear),
        ref: takenDateRef,
      },
    ];

    const firstInvalid = requiredFields.find((field) => !field.valid);
    if (firstInvalid) {
      setFormErrors({ [firstInvalid.key]: "This field is required" });
      firstInvalid.ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      firstInvalid.ref.current?.focus();
      notifications.show({
        title: "Missing information",
        message: `Please add ${firstInvalid.label} before submitting.`,
        color: "red",
      });
      return;
    }

    setFormErrors({});
    mutation.mutate(formData);
  };
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
      notifications.show({
        title: "Review submitted",
        message: "Thanks for sharing your experience with the class.",
        color: "green",
      });
    },
    onError: () =>
      notifications.show({
        title: "Something went wrong",
        message: "Couldn't submit your review. Please try again.",
        color: "red",
      }),
  });

  const reviewCount = data?.pages.reduce((n, page) => n + page.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="px-6 sm:px-10 lg:px-18 pt-20 pb-12">

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

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex flex-col">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
              Student Reviews
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none !m-0">
                {course
                  ? course.includes("Capstone")
                    ? "Capstone"
                    : course
                  : "Browse all reviews"}
              </h1>
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
              <p className="text-sm text-gray-500 mt-1">
                Showing {reviewCount} of {fetchedChartData.length.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={openFilter}
              className="flex-1 sm:flex-none border border-gray-300 bg-white text-gray-900 text-sm font-semibold px-5 h-11 hover:border-gray-900 transition-colors"
            >
              Filters
            </button>
            <button
              onClick={open}
              className="flex-1 sm:flex-none bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 h-11 transition-colors"
            >
              Write a review
            </button>
          </div>
        </div>

        <Modal
          opened={opened}
          onClose={close}
          radius={0}
          title={
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-900">
              Create New Course Review
            </span>
          }
          classNames={{
            content: "!rounded-none",
            header: "!border-b !border-gray-200 !pb-4",
            body: "!p-0",
          }}
        >
          <div className="flex flex-col gap-4 pt-2 pb-1 px-[var(--mantine-spacing-md)] max-h-[55vh] overflow-y-auto">
            <Select
              ref={courseNameRef}
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
              radius={0}
              error={formErrors.course_name}
              classNames={getFieldClassNames(Boolean(formErrors.course_name))}
              clearable
            />
            <Select
              ref={difficultyRef}
              label="Course Difficulty (1-5)"
              placeholder="Enter Course Difficulty"
              data={["1", " 2", "3", "4", "5"]}
              value={formData.course_difficulty}
              onChange={(v) => {
                const n = Number(v);
                if (!isNaN(n))
                  handleCourseInputChange("course_difficulty", n.toString());
              }}
              radius={0}
              error={formErrors.course_difficulty}
              classNames={getFieldClassNames(Boolean(formErrors.course_difficulty))}
              clearable
            />
            <Select
              ref={timeSpentRef}
              label="Time Spent Per Week"
              placeholder="E.g., 0-5 hours"
              data={["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"]}
              value={formData.course_time_spent_per_week}
              onChange={(v) =>
                handleCourseInputChange("course_time_spent_per_week", v ?? "")
              }
              radius={0}
              error={formErrors.course_time_spent_per_week}
              classNames={getFieldClassNames(
                Boolean(formErrors.course_time_spent_per_week)
              )}
            />
            <Select
              value={formData.course_enjoyability}
              onChange={(v) =>
                handleCourseInputChange("course_enjoyability", v ?? "")
              }
              label="Course Enjoyability"
              placeholder="Select Course Enjoyability"
              data={["Enjoyable", "Neutral", "Not Enjoyable"]}
              radius={0}
              classNames={getFieldClassNames()}
              clearable
            />
            <Textarea
              ref={tipsRef}
              placeholder="Enter Tips for the Course"
              label="Course Tips"
              autosize
              minRows={2}
              value={formData.course_tips}
              onChange={(e) =>
                handleCourseInputChange("course_tips", e.target.value)
              }
              radius={0}
              error={formErrors.course_tips}
              classNames={getFieldClassNames(Boolean(formErrors.course_tips))}
            />
            <div>
              <div ref={takenDateRef} className="flex gap-4 w-full">
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
                  radius={0}
                  classNames={getFieldClassNames(Boolean(formErrors.course_taken_date))}
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
                  radius={0}
                  classNames={getFieldClassNames(Boolean(formErrors.course_taken_date))}
                />
              </div>
              {formErrors.course_taken_date && (
                <p className="text-red-600 text-xs mt-1">
                  Please select both a term and a year.
                </p>
              )}
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
              radius={0}
              classNames={getFieldClassNames()}
              clearable
            />
          </div>
          <div className="px-[var(--mantine-spacing-md)] pb-[var(--mantine-spacing-md)] pt-4 border-t border-gray-200">
            <button
              onClick={handleCourseSubmit}
              className="w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 h-11 transition-colors"
            >
              Submit
            </button>
          </div>
        </Modal>

        <div className="flex flex-col md:flex-row gap-12 items-stretch md:h-[70vh] md:min-h-[520px]">

          <motion.div
            className="order-2 md:order-1 flex-1 min-w-0 border-t border-gray-900 md:h-full"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div
              className={`h-full overflow-y-auto no-scrollbar ${
                status === "pending" ? "opacity-60" : ""
              }`}
            >
              {status === "pending" && (
                <>
                  <Skeleton height={160} radius="sm" my="lg" />
                  <Skeleton height={160} radius="sm" my="lg" />
                  <Skeleton height={160} radius="sm" my="lg" />
                </>
              )}

              {data?.pages.map((page, pageIndex) =>
                page.map((courseItem: CourseInfo) => (
                  <Skeleton
                    visible={isLoadingCourses}
                    key={`${pageIndex}-${courseItem._id}`}
                    radius="sm"
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

          <ReviewStats data={fetchedChartData} isLoading={isChartLoading} />
        </div>
      </div>
    </div>
  );
}

export default Courses;
