import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import * as ReactApexChartModule from "react-apexcharts";
import { resolveDefaultExport } from "../misc/utils";

const ReactApexChart = resolveDefaultExport<typeof import("react-apexcharts").default>(
  ReactApexChartModule
);
import type { ApexOptions } from "apexcharts";
import { Skeleton } from "@mantine/core";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import background from "../assets/Beaver_background.png";
import { useEffect, useMemo, useRef, useState } from "react";

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

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(420);

  // Belt-and-suspenders: keep this page locked to one screen even if a
  // tooltip or other overlay momentarily overflows the flex layout (e.g.
  // rounding at non-100% browser zoom).
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      if (height > 0) setChartHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const { series, options } = useMemo(() => {
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
        height: chartHeight,
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
              <div>Reviews: ${point.meta.countLabel}</div>
            </div>
          `;
        },
      },
    };

    return { series, options };
  }, [data, dispatch, navigate, chartHeight]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f7f5f0]">
      <img
        src={background}
        alt="Background"
        className="hidden md:inline fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-2 object-contain"
        style={{ width: "600px", height: "auto" }}
      />
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-6 pt-20 pb-6">
        <div className="shrink-0 mb-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
            Difficulty Chart
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none !m-0">
            Difficulty vs. hours
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">
            Each bubble is a course, sized by review count. Click one to jump
            to its reviews.
          </p>
        </div>

        <div
          ref={chartContainerRef}
          className="flex-1 min-h-0 bg-white border border-gray-200 p-4 md:p-6"
        >
          <Skeleton visible={isLoading} className="h-full">
            <ReactApexChart
              options={options}
              series={series}
              type="bubble"
              height={chartHeight}
            />
          </Skeleton>
        </div>

        <div className="shrink-0 mt-3 flex flex-wrap content-start gap-2">
          {series[0].data.map((pt) => (
            <span
              key={pt.name}
              className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-gray-700 font-medium px-2.5 py-1 rounded-full border border-orange-100"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: pt.fillColor }}
              />
              {pt.name.split("-")[0].trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Route;
