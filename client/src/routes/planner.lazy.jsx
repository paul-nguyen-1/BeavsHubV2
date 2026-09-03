import { createLazyFileRoute } from "@tanstack/react-router";
import { LayoutFlowWithProvider } from "../components/reactFlow/layoutFlow";
import background from "../assets/Beaver_background.png";
import { useDisclosure } from "@mantine/hooks";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div style={{ width: "100vw", height: "100vh" }} className="bg-[#f7f5f0]">
      <img
        src={background}
        alt="Background"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 object-contain"
        style={{ width: "600px", height: "auto" }}
      />

      <div className="md:hidden flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="font-black text-lg text-gray-900 mb-2">
          Degree Planner
        </p>
        <p className="text-sm text-gray-500">
          The degree planner works best on a bigger screen. Switch to a
          tablet or desktop to explore prerequisites and plan your courses.
        </p>
      </div>

      <div className="hidden md:block h-full">
        <div className="w-full px-6 pt-20 pb-5">
          <div className="flex flex-row flex-wrap items-center justify-between gap-4 w-full bg-white border border-gray-200 px-6 py-5">
            <div className="flex flex-col">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
                Degree Planner
              </p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                Computer Science Degree Map
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Click and view various classes and their prerequisites
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={open}
                className="border border-gray-300 bg-white text-gray-900 text-sm font-semibold px-5 h-11 hover:border-gray-900 transition-colors"
              >
                View Planner
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("flowNodes");
                  localStorage.removeItem("flowEdges");
                  window.location.reload();
                }}
                className="bg-[#d73f09] hover:bg-[#b83607] text-white text-sm font-semibold px-5 h-11 transition-colors"
              >
                Clear Planner
              </button>
            </div>
          </div>
        </div>
        <LayoutFlowWithProvider opened={opened} open={open} close={close} />
      </div>
    </div>
  );
}
