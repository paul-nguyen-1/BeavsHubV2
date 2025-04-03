import {
  Avatar,
  Badge,
  Group,
  Paper,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { CourseCard } from "../misc/types";
import { useMediaQuery } from "@mantine/hooks";
import user from "../assets/Profile_icon_fill.svg";
import { classType } from "../misc/utils";
import { AppDispatch } from "../../app/store";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";

export function Course(props: CourseCard) {
  const {
    course,
    difficulty,
    time_spent_per_week,
    taken_date,
    enjoyability,
    tips,
    timestamp,
    pairs,
  } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const dispatch = useDispatch<AppDispatch>();
  const handleCourseChange = (value: string | null) => {
    dispatch(setSelectedCourse(value));
  };

  return (
    <Paper
      withBorder
      radius="md"
      className="p-5 w-full flex md:flex-col cursor-pointer"
      onClick={() => handleCourseChange(course)}
    >
      <div className="w-full flex align-top justify-between">
        <div className="flex flex-col md:flex-row gap-2">
          <Avatar
            src={user}
            alt="Avatar"
            radius="xl"
            className="md:relative md:top-5"
          />
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:gap-1 md:items-center">
              <Text fz="sm">{isMobile ? course.slice(0, 30) : course}</Text>
              <Text fz="sm" c="dimmed">
                @ {new Date(timestamp).toLocaleDateString()}
              </Text>
            </div>
            <Text fz="sm">Difficulty: {difficulty}</Text>
            {enjoyability && <Text fz="sm">Enjoyability: {enjoyability}</Text>}
            <Text fz="sm">Time Spent Per Week: {time_spent_per_week}</Text>
            {taken_date && <Text fz="sm">Semester: {taken_date}</Text>}
            {pairs.length !== 0 && (
              <div className="flex flex-row items-center flex-wrap gap-2">
                <Text size="sm">Course Pair(s):</Text>
                <Group>
                  {pairs.map((pair, index) => (
                    <Badge key={index} radius="xl" size="lg" variant="light">
                      {pair}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}
          </div>
        </div>
        <div className="h-full flex flex-col align-top items-end">
          <div
            className={`${
              classType(course) === "Core" ? "bg-[#d73f09]" : "bg-[#f28705]"
            } text-white text-xs px-3 py-1 rounded-full w-16 flex justify-center`}
          >
            {classType(course)}
          </div>
        </div>
      </div>
      <TypographyStylesProvider>
        <div className="pt-2">
          {tips == "" ? (
            <div>No comments were submitted for this post.</div>
          ) : (
            <div>{tips}</div>
          )}
        </div>
      </TypographyStylesProvider>
    </Paper>
  );
}
