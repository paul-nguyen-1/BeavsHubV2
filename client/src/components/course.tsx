import { CourseCard } from "../misc/types";
import user from "../assets/Profile_icon_fill.svg";
import { classType } from "../misc/utils";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
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

  const dispatch = useDispatch<AppDispatch>();
  const globalCourse = useSelector(
    (state: RootState) => state.useCourse.selectedCourse
  );

  const isCore = classType(course) === "Core";

  const stats = [
    { label: "Difficulty", value: `${difficulty} / 5` },
    { label: "Hours/wk", value: time_spent_per_week },
    ...(enjoyability ? [{ label: "Enjoyability", value: enjoyability }] : []),
    ...(taken_date ? [{ label: "Semester", value: taken_date }] : []),
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-full ${
        !globalCourse ? "cursor-pointer" : ""
      }`}
      onClick={() => dispatch(setSelectedCourse(course))}
    >
      <div className={`h-1 w-full ${isCore ? "bg-[#d73f09]" : "bg-[#f28705]"}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <img src={user} alt="Avatar" className="w-5 h-5 opacity-40" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 line-clamp-1">{course}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span
            className={`${
              isCore ? "bg-[#d73f09]" : "bg-[#f28705]"
            } text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2`}
          >
            {classType(course)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs"
            >
              <span className="text-gray-400 font-medium">{stat.label}</span>
              <span className="text-gray-800 font-bold">{stat.value}</span>
            </span>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
          {tips ? (
            <p className="text-sm text-gray-700 leading-relaxed">{tips}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No comments were submitted for this post.
            </p>
          )}
        </div>

        {pairs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-gray-400 font-medium">Paired with:</span>
            {pairs.map((pair, index) => (
              <span
                key={index}
                className="text-xs bg-orange-50 text-[#d73f09] font-semibold px-2.5 py-0.5 rounded-full border border-orange-100"
              >
                {pair}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
