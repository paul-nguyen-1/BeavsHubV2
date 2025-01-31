import {
  Avatar,
  Group,
  Paper,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { CourseCard } from "../lib/types";
import { useMediaQuery } from "@mantine/hooks";
import user from "/user.png?url";

export function Course(props: CourseCard) {
  const {
    course,
    difficulty,
    time_spent_per_week,
    taken_date,
    enjoyability,
    tips,
    timestamp,
  } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Paper withBorder radius="md" className="p-5 w-full">
      <Group>
        <Avatar src={user} alt="Avatar" radius="xl" />
        <div>
          <Text fz="sm">{isMobile ? course.slice(0, 30) : course}</Text>
          <Text fz="sm">Difficulty: {difficulty}</Text>
          <Text fz="sm">Enjoyability: {enjoyability}</Text>
          <Text fz="sm">Time Spent Per Week: {time_spent_per_week}</Text>
          <Text fz="xs" c="dimmed">
            Posted: {new Date(timestamp).toLocaleDateString()}
          </Text>
          <Text fz="xs" c="dimmed">
            {taken_date}
          </Text>
        </div>
      </Group>
      <TypographyStylesProvider>
        <div>
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
