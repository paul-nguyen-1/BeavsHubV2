import { createLazyFileRoute } from "@tanstack/react-router";
import Map from "../components/map";

export const Route = createLazyFileRoute("/tour")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 py-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center text-[#D73F09] mb-4">
        Discover Oregon State with BeavsHub
      </h2>
      <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
        Built by a Beaver, for Beavers. Your go-to platform for course reviews,
        campus exploration, and student-driven insights.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-800 text-base leading-relaxed">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-[#D73F09]">
            Why BeavsHub?
          </h3>
          <p className="mb-4">
            BeavsHub was built to solve a simple problem: OSU students needed a
            better way to plan their academic journey. From honest course
            reviews to interactive maps, BeavsHub puts everything you need in
            one place.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Created in 2025 with students in mind</li>
            <li>Browse real feedback on courses with ratings</li>
            <li>Explore campus with integrated maps and street views</li>
          </ul>
        </div>

        <div className="text-right">
          <h3 className="text-2xl font-semibold mb-4 text-[#D73F09]">
            About Me
          </h3>
          <p>
            I'm a Computer Science student at Oregon State University,
            passionate about making tech that actually helps people. I created
            BeavsHub as a way to give back to the community that’s shaped my
            experience today — and to make your journey a little smoother along
            the way.
          </p>
        </div>
      </div>
      <h2 className="w-full mt-4 text-2xl font-bold text-[#D73F09] text-center">
        Go Beavs 🦫
      </h2>
      <div className="flex justify-center mb-16 pt-10">
        <div className="w-full md:w-[90%] lg:w-[80%] xl:w-[70%]">
          <Map />
        </div>
      </div>
    </div>
  );
}
