import {
  Avatar,
  Group,
  Paper,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { CourseCard } from "../lib/types";
import { useMediaQuery } from "@mantine/hooks";

export function Course(props: CourseCard) {
  const {
    course,
    difficulty,
    time_spent_per_week,
    taken_date,
    tips,
    timestamp,
  } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Paper withBorder radius="md" className="my-2.5 p-5 w-full md:w-3/4">
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          alt="Avatar"
          radius="xl"
        />
        <div>
          <Text fz="sm">{isMobile ? course.slice(0, 30) : course}</Text>
          <Text fz="sm">Difficulty: {difficulty}</Text>
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
            <div>No tips available for this post.</div>
          ) : (
            <div>{tips}</div>
          )}
        </div>
      </TypographyStylesProvider>
    </Paper>
  );
}
