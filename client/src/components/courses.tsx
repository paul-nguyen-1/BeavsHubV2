import { getAllCourses } from "../lib/const";
import { CourseInfo } from "../lib/types";
import { useFetchData } from "../lib/utils";
import { Course } from "./course";

function Courses() {
  const { isLoading, error, data } = useFetchData(
    ["allCoursesData"],
    getAllCourses
  );
  if (isLoading)
    return (
      <div className="p-2">
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          </div>

          <div className="h-24 bg-gray-300 rounded-lg animate-pulse"></div>

          <div className="h-10 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.courseRecords.map((course: CourseInfo) => (
        <Course
          key={course._id}
          difficulty={course.course_difficulty}
          course={course.course_name}
          taken_date={course.course_taken_date}
          time_spent_per_week={course.course_time_spent_per_week}
          timestamp={new Date(course.timestamp).toLocaleString()}
          tips={course.course_tips}
        />
      ))}
    </div>
  );
}

export default Courses;
