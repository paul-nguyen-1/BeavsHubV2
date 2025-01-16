import { BarChart, DonutChart, PieChart } from "@mantine/charts";
import { Text } from "@mantine/core";
import {
  BarChartDataItem,
  PieChartDataItem,
  DonutChartDataItem,
} from "../../lib/types";

const colorPalette = ["#6FCF97", "#F2C94C", "#F2994A", "#EB5757", "#D32F2F"];
const difficultyType = ["Easy A", "Medium", "Hard", "Very Hard", "Insane"];
const sortedTimeSpent = ["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"];

export const getColor = (index: number, reverse?: boolean) => {
  const palette = reverse ? colorPalette.slice().reverse() : colorPalette;
  const colorIndex = Math.min(index, palette.length - 1);
  return palette[colorIndex];
};

export const BarChartMantine = (props: { data: BarChartDataItem[] }) => {
  const { data } = props;
  const flattenedData = Array.isArray(data) ? data.flat() : [];

  const pairCounts = flattenedData.reduce<Record<string, number>>(
    (count, item) => {
      const pairs = item.pairs || [];
      pairs.forEach((pair: string) => {
        count[pair] = (count[pair] || 0) + 1;
      });
      return count;
    },
    {}
  );

  const barChartData = Object.entries(pairCounts)
    .map(([pair, count]) => ({
      pair,
      count: Number(count),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="md:w-[500px] w-[350px]">
      <Text fz="xs" mb="sm" ta="center">
        Bar Chart: Course Pairing Data
      </Text>
      <BarChart
        h={300}
        data={barChartData}
        dataKey="pair"
        getBarColor={(pairIndex) => {
          return getColor(pairIndex, true);
        }}
        series={[
          {
            name: "count",
          },
        ]}
      />
    </div>
  );
};

export const PieChartMantine = (props: { data: PieChartDataItem[] }) => {
  const { data } = props;
  const flattenedData = Array.isArray(data) ? data.flat() : [];

  const difficultyCounts = flattenedData.reduce<Record<number, number>>(
    (count, item) => {
      const difficulty = item.course_difficulty;
      count[difficulty] = (count[difficulty] || 0) + 1;
      return count;
    },
    {}
  );

  const pieChartData = Object.entries(difficultyCounts).map(
    ([difficulty, count]) => ({
      name: `Difficulty: ${difficultyType[Number(difficulty) - 1]} (${difficulty})`,
      value: count,
      color: getColor(Number(difficulty) - 1),
    })
  );

  return (
    <div>
      <Text fz="xs" mb="sm" ta="center">
        Pie Chart: Course Difficulty Data
      </Text>
      <PieChart
        data={pieChartData}
        withTooltip
        tooltipDataSource="segment"
        mx="auto"
      />
    </div>
  );
};
export const DonutChartMantine = (props: { data: DonutChartDataItem[] }) => {
  const { data } = props;
  const flattenedData = Array.isArray(data) ? data.flat() : [];

  const timeSpentCounts = flattenedData.reduce<Record<string, number>>(
    (count, item) => {
      const timeSpentArray = Array.isArray(item.course_time_spent_per_week)
        ? item.course_time_spent_per_week
        : [item.course_time_spent_per_week];

      timeSpentArray.forEach((time) => {
        count[time] = (count[time] || 0) + 1;
      });

      return count;
    },
    {}
  );

  const donutChartData = sortedTimeSpent.map((time, index) => ({
    name: `Time Spent: ${time}`,
    value: timeSpentCounts[time] || 0,
    color: getColor(index),
  }));

  return (
    <div>
      <Text fz="xs" mb="sm" ta="center">
        Donut Chart: Time Spent Per Week (Hours)
      </Text>
      <DonutChart tooltipDataSource="segment" mx="auto" data={donutChartData} />
    </div>
  );
};
