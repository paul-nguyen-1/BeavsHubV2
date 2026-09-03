import { CourseCard } from "../misc/types";
import { classType, splitString, termAbbrev } from "../misc/utils";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";

export function Course(props: CourseCard) {
  const { course, difficulty, time_spent_per_week, taken_date, tips, timestamp, pairs } = props;

  const dispatch = useDispatch<AppDispatch>();
  const globalCourse = useSelector(
    (state: RootState) => state.useCourse.selectedCourse
  );

  const [code, title] = splitString(course, " - ");
  const type = classType(course);

  return (
    <div
      className={`py-6 border-b border-gray-200 ${!globalCourse ? "cursor-pointer" : ""}`}
      onClick={() => dispatch(setSelectedCourse(course))}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-2.5 flex-wrap min-w-0">
          <span className="font-mono font-black text-lg text-gray-900 shrink-0">
            {code}
          </span>
          <span className="font-bold text-gray-900">{title || course}</span>
          {type !== "N/A" && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-gray-500 shrink-0">
              {type}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400 shrink-0">
          {new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 mb-3 font-mono text-[11px] uppercase tracking-widest text-gray-500">
        <span>
          Difficulty <b className="text-gray-900">{difficulty} / 5</b>
        </span>
        <span>
          Hours / wk{" "}
          <b className="text-gray-900">{time_spent_per_week?.replace(" hours", "")}</b>
        </span>
        {taken_date && (
          <span>
            Term <b className="text-gray-900">{termAbbrev(taken_date)}</b>
          </span>
        )}
      </div>

      {tips ? (
        <p className="text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-4">
          {tips}
        </p>
      ) : (
        <p className="text-gray-400 italic border-l-2 border-gray-200 pl-4">
          No comments were submitted for this post.
        </p>
      )}

      {pairs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span className="text-sm text-gray-500 font-medium">Paired with:</span>
          {pairs.map((pair) => (
            <button
              key={pair}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setSelectedCourse(pair));
              }}
              className="text-xs bg-orange-50 text-[#d73f09] font-semibold px-2.5 py-0.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              {pair}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
