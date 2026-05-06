import { createLazyFileRoute } from "@tanstack/react-router";
import { LayoutFlowWithProvider } from "../components/reactFlow/layoutFlow";
import background from "../assets/Beaver_background.png";
import { Button, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <img
        src={background}
        alt="Background"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 object-contain"
        style={{ width: "600px", height: "auto" }}
      />
      <div className="w-full px-5 md:px-32 py-5">
        <div className="relative top-2 flex flex-row flex-wrap items-center justify-between w-full bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-2 p-5">
            <Text fz="xl">Computer Science Degree Map</Text>
            <Text fz="sm">
              Click and view various classes and their prerequisites
            </Text>
          </div>
          <div className="flex items-center gap-2 p-5">
            <Button variant="default" size="sm" onClick={open}>
              View Planner
            </Button>
            <Button
              size="sm"
              color="#d73f09"
              onClick={() => {
                localStorage.removeItem("flowNodes");
                localStorage.removeItem("flowEdges");
                window.location.reload();
              }}
            >
              Clear Planner
            </Button>
          </div>
        </div>
      </div>
      <LayoutFlowWithProvider opened={opened} open={open} close={close} />
    </div>
  );
}
