import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Pill, Skeleton } from "@mantine/core";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";

type Row = {
  _id: string;
  count?: number;
  avg_difficulty?: number;
  avg_hours?: number;
};

const palette = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
  "#393b79",
  "#637939",
  "#8c6d31",
  "#843c39",
  "#7b4173",
  "#3182bd",
  "#31a354",
  "#756bb1",
  "#636363",
  "#e6550d",
];

const hashString = (s: string) =>
  s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

const colorForKey = (key: string) =>
  palette[Math.abs(hashString(key)) % palette.length];

export const Route = createFileRoute("/chart")({
  component: RouteComponent,
});

function RouteComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fetchChartData = async (): Promise<Row[]> => {
    const response = await fetch(`${getAllCourses}/courses/frequency`);
    if (!response.ok) throw new Error("Failed to fetch chart data");
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["chartData"],
    queryFn: fetchChartData,
  });

  type BubblePoint = {
    x: number;
    y: number;
    z: number;
    name: string;
    fillColor: string;
    meta: { hoursLabel: string; difficultyLabel: string; countLabel: number };
  };
  type BubbleSeries = { name: string; data: BubblePoint[] };
  type ApexWithSeries = ApexOptions & { series: BubbleSeries[] };
  type DataPointConfig = {
    seriesIndex: number;
    dataPointIndex: number;
    w: { config: ApexWithSeries };
  };
  type TooltipArgs = {
    seriesIndex: number;
    dataPointIndex: number;
    w: { config: ApexWithSeries };
  };

  const { series, options } = React.useMemo(() => {
    const points = (data ?? [])
      .map((row) => {
        const courseName = row._id?.trim() || "Unknown";
        const averageHours = Number(row.avg_hours ?? 0);
        const averageDifficulty = Number(row.avg_difficulty ?? 0);
        const responseCount = Number(row.count ?? 0);
        if (!(averageHours > 0 && averageDifficulty > 0 && responseCount > 0)) {
          return null;
        }
        return {
          x: averageHours,
          y: averageDifficulty,
          z: responseCount,
          name: courseName,
          fillColor: colorForKey(courseName),
          meta: {
            hoursLabel: averageHours.toFixed(1),
            difficultyLabel: averageDifficulty.toFixed(2),
            countLabel: responseCount,
          },
        };
      })
      .filter(Boolean) as Array<{
      x: number;
      y: number;
      z: number;
      name: string;
      fillColor: string;
      meta: { hoursLabel: string; difficultyLabel: string; countLabel: number };
    }>;

    const maxHours = points.length ? Math.max(...points.map((p) => p.x)) : 20;
    const xMax = Math.ceil(maxHours * 1.1);

    const series: BubbleSeries[] = [{ name: "Courses", data: points }];

    const options: ApexOptions = {
      chart: {
        type: "bubble",
        height: 520,
        toolbar: { show: false },
        zoom: { enabled: false },
        events: {
          dataPointSelection: (
            _event: unknown,
            _chartContext: unknown,
            config: DataPointConfig
          ) => {
            const point =
              config.w.config.series[config.seriesIndex].data[
                config.dataPointIndex
              ];
            if (point && point.name) {
              console.log(point.name);
              dispatch(setSelectedCourse(point.name));
              navigate({ to: "/reviews" });
            }
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { strokeDashArray: 3 },
      stroke: { width: 0.6 },
      fill: { opacity: 0.9 },
      xaxis: {
        type: "numeric",
        min: 0,
        max: xMax,
        tickAmount: 10,
        title: { text: "Average Hours per Week" },
        labels: {
          formatter: (val: number | string) => {
            const n = Number(val);
            return Number.isFinite(n) ? n.toFixed(0) : "";
          },
        },
      },
      yaxis: {
        min: 0,
        max: 5,
        tickAmount: 5,
        title: { text: "Average Difficulty (1–5)" },
        labels: {
          formatter: (val: number | string) => {
            const n = Number(val);
            return Number.isFinite(n) ? n.toFixed(1) : "";
          },
        },
      },
      plotOptions: {
        bubble: { minBubbleRadius: 14, maxBubbleRadius: 50, zScaling: true },
      },
      tooltip: {
        custom: ({ seriesIndex, dataPointIndex, w }: TooltipArgs) => {
          const point =
            w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
          if (!point) return "";
          const dot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${point.fillColor};margin-right:6px;vertical-align:middle;"></span>`;
          return `
            <div style="padding:8px 10px;">
              <div style="font-weight:600;margin-bottom:6px;">${dot}${point.name}</div>
              <div>Average Hours: ${point.meta.hoursLabel}</div>
              <div>Average Difficulty: ${point.meta.difficultyLabel}</div>
              <div>Responses: ${point.meta.countLabel}</div>
            </div>
          `;
        },
      },
    };

    return { series, options };
  }, [data, dispatch, navigate]);

  return (
    <Skeleton visible={isLoading} height={520}>
      <div className="w-full p-4">
        <ReactApexChart
          options={options}
          series={series}
          type="bubble"
          height={520}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {series[0].data.map((pt) => (
            <div key={pt.name} className="flex items-center text-xs">
              <Pill
                key={pt.name}
                size="sm"
                radius="xl"
                className="flex align-center justify-center gap-2"
              >
                <span
                  className="inline-block relative top-0.5 w-3 h-3 mr-1 rounded-full"
                  style={{ backgroundColor: pt.fillColor }}
                />
                <span>{pt.name.split("-")[0].trim()}</span>
              </Pill>
            </div>
          ))}
        </div>
      </div>
    </Skeleton>
  );
}

export default Route;
