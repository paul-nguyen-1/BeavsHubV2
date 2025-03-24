import { QuickActions } from "./ui/buttons";

function Home() {
  return (
    <>
      <div>
        <h1></h1>
        <h2></h2>
      </div>
      <div>
        <h1>Popular Courses</h1>
        <div></div>
      </div>
      <div>
        <h1>Quick Actions</h1>
        <div className="flex">
          <QuickActions
            image={"../assets/header.svg"}
            alt={"Quick Actions"}
            header={"Title"}
          />
          <QuickActions
            image={"../assets/header.svg"}
            alt={"Quick Actions"}
            header={"Title"}
          />
          <QuickActions
            image={"../assets/header.svg"}
            alt={"Quick Actions"}
            header={"Title"}
          />
          <QuickActions
            image={"../assets/header.svg"}
            alt={"Quick Actions"}
            header={"Title"}
          />
        </div>
      </div>
    </>
  );
}

export default Home;
