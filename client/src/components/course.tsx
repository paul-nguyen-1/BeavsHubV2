import {
  Avatar,
  Group,
  Paper,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { CourseCard } from "../lib/types";

export function Course(props: CourseCard) {
  const {
    course,
    difficulty,
    time_spent_per_week,
    taken_date,
    tips,
    timestamp,
  } = props;
  return (
    <Paper withBorder radius="md">
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          alt="Avatar"
          radius="xl"
        />
        <div>
          <Text fz="sm">{course}</Text>
          <Text fz="sm">Difficulty: {difficulty}</Text>
          <Text fz="sm">Timme Spent Per Week: {time_spent_per_week}</Text>
          <Text fz="xs" c="dimmed">
            Posted: {timestamp}
          </Text>
          <Text fz="xs" c="dimmed">
            {taken_date}
          </Text>
        </div>
      </Group>
      <TypographyStylesProvider>
        <div>{tips}</div>
      </TypographyStylesProvider>
    </Paper>
  );
}
