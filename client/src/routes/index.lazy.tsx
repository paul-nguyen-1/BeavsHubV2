import { createLazyFileRoute } from "@tanstack/react-router";
import Courses from "../components/courses";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Courses />
      <div className="p-2">
        {/* 
      lazy loading 
      <div className="p-4 space-y-4">
      <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
      
      <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
      </div>
      
      <div className="h-24 bg-gray-300 rounded-lg animate-pulse"></div>
      
      <div className="h-10 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div> */}
      </div>
      <div className="underline"> hello</div>
      <div className="text-3xl font-bold underline text-lime-500">
        Debug Test
      </div>

      <div className="each h-screen"></div>
      <div className="each h-screen"></div>
    </>
  );
}
