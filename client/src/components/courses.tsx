import { getAllCourses } from "../const/const";
import { useFetchData } from "../utils/utils";

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

  console.log("data", data);

  return <div>Courses</div>;
}

export default Courses;
