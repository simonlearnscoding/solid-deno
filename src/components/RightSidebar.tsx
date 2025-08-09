export default function RightSidebar(props: {}) {
  return (
    <div class="w-96  flex-col gap-3 p-4 bg-base-200 hidden xl:flex">
      <div class="card bg-base-100 rounded-md shadow-sm">
        <div class="card-body">
          <h4 class="font-semibold">Next Training</h4>
          <h3>Soccer Practice</h3>
          <div class="flex">
            <p class="font-medium ">Tue, 12 Aug</p>
            <div class="divider divider-horizontal mx-1" />

            <p>18:00 - 19:00</p>
          </div>

          <div class="flex gap-2 mt-1">
            <button class="btn  flex-1">Present</button>
            <button class="btn btn-ghost flex-1">Absent</button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm  rounded-md">
        <div class="card-body">
          <h2 class="card-title">This Week</h2>
          <div class="flex">
            <div>
              Tue - <span class="font-bold">Beginner Boxing</span>
            </div>
            <div class="text-end ml-auto"> 14:00 - 15:00</div>
          </div>

          <div class="flex">
            <div>
              Thu - <span class="font-bold">Soccer Practice</span>
            </div>
            <div class="text-end ml-auto"> 14:00 - 15:00</div>
          </div>
          <div class="flex  ">
            <div class="   truncate min-w-0 mr-5 ">
              Tue -{" "}
              <span class="font-bold ">Soccer Practice Beginner Boxing</span>
            </div>
            <div class="text-end ml-auto min-w-fit"> 14:00 - 15:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
