import { useEffect, useState } from "react";
import { BarChart, DonutChart, PieChart } from "@mantine/charts";
import { Skeleton, Text } from "@mantine/core";
import {
  BarChartDataItem,
  PieChartDataItem,
  DonutChartDataItem,
} from "../../misc/types";
import { Legend } from "recharts";
import { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../../hooks/useCourse";
import { setSelectedDifficulty } from "../../hooks/useDifficulty";
import { setSelectedHours } from "../../hooks/useHours";

const colorPalette = ["#6FCF97", "#F2C94C", "#F2994A", "#EB5757", "#D32F2F"];
const difficultyType = ["Easy A", "Medium", "Hard", "Very Hard", "Insane"];
const sortedTimeSpent = ["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"];

const getColor = (index: number, reverse?: boolean) => {
  const palette = reverse ? colorPalette.slice().reverse() : colorPalette;
  const colorIndex = Math.min(index, palette.length - 1);
  return palette[colorIndex];
};

type ChartDataItem = {
  name: string;
  value: number;
};

const chartState = (chart: ChartDataItem[]): boolean => {
  if (!chart || chart.length === 0) {
    return false;
  }
  return chart.some((data) => data.value > 0);
};

export const BarChartMantine = (props: {
  data: BarChartDataItem[];
  isLoading: boolean;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = props;
  const flattenedData = Array.isArray(data) ? data.flat() : [];

  const pairCounts = flattenedData.reduce<Record<string, number>>(
    (value, item) => {
      const pairs = item.pairs || [];
      pairs.forEach((pair: string) => {
        value[pair] = (value[pair] || 0) + 1;
      });
      return value;
    },
    {}
  );

  const barChartData = Object.entries(pairCounts)
    .map(([pair, value]) => ({
      name: pair.slice(0, 6).trim(),
      value: Number(value),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      color: getColor(index),
    }));

  return (
    <Skeleton visible={isLoading} height={250}>
      <div>
        {chartState(barChartData) ? (
          <div className="flex flex-col items-center relative bottom-5 md:bottom-8">
            <Text fz="xs" mb="sm" ta="center">
              Most Common Course Pairing
            </Text>
            <BarChart
              h={230}
              data={barChartData}
              orientation="vertical"
              dataKey="name"
              series={[
                {
                  name: "value",
                },
              ]}
              barProps={() => ({
                onClick: (barData) => {
                  dispatch(setSelectedCourse(barData.name));
                },
                style: { cursor: "pointer" },
              })}
            />
          </div>
        ) : null}
      </div>
    </Skeleton>
  );
};

export const PieChartMantine = (props: {
  data: PieChartDataItem[];
  isLoading: boolean;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = props;
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);

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
      name: `${difficultyType[Number(difficulty) - 1]} (${difficulty})`,
      value: count,
      color: getColor(Number(difficulty) - 1),
    })
  );

  useEffect(() => {
    if (!isLoading && !chartState(pieChartData)) {
      const timer = setTimeout(() => {
        setShowNoDataMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowNoDataMessage(false);
    }
  }, [isLoading, pieChartData]);

  return (
    <Skeleton visible={isLoading} height={250}>
      <div className="w-[190px]">
        {chartState(pieChartData) ? (
          <>
            <PieChart
              data={pieChartData}
              withTooltip
              tooltipDataSource="segment"
              mx="auto"
              pieProps={{
                onClick: (sliceData) => {
                  const parsedDifficulty =
                    String(sliceData?.payload?.name).match(/\d+/)?.[0] ?? null;
                  dispatch(setSelectedDifficulty(parsedDifficulty));
                },
                style: { cursor: "pointer" },
              }}
            >
              <Legend
                verticalAlign="bottom"
                height={1}
                wrapperStyle={{
                  fontSize: "12px",
                  width: "190px",
                  position: "relative",
                  top: "5px",
                  right: "5px",
                }}
              />
            </PieChart>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center gap-3 md:w-[85vw]">
            {showNoDataMessage && <></>}
          </div>
        )}
      </div>
    </Skeleton>
  );
};

export const DonutChartMantine = (props: {
  data: DonutChartDataItem[];
  isLoading: boolean;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = props;
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
    name: `${time}`,
    value: timeSpentCounts[time] || 0,
    color: getColor(index),
  }));
  return (
    <Skeleton visible={isLoading} height={250}>
      <div className="w-[190px]">
        {chartState(donutChartData) ? (
          <>
            <DonutChart
              tooltipDataSource="segment"
              mx="auto"
              data={donutChartData}
              pieProps={{
                onClick: (sliceData) => {
                  dispatch(setSelectedHours(sliceData?.payload?.name));
                },
                style: { cursor: "pointer" },
              }}
            >
              <Legend
                verticalAlign="bottom"
                height={1}
                wrapperStyle={{
                  fontSize: "12px",
                  width: "190px",
                  position: "relative",
                  top: "5px",
                  right: "7.5px",
                }}
              />
            </DonutChart>
          </>
        ) : null}
      </div>
    </Skeleton>
  );
};
