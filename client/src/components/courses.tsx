import { getAllCourses } from "../const/const";
import { useFetchData } from "../utils/utils";

function Courses() {
  const { isLoading, error, data } = useFetchData(
    ["allCoursesData"], 
    getAllCourses
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log("data", data);

  return <div>Courses</div>;
}

export default Courses;
