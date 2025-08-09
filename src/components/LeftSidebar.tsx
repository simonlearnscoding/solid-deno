import type { Accessor } from "solid-js";
export default function LeftSidebar(props: {
  search: Accessor<string>;
  onSearch: (value: string) => void;
}) {
  return (
    <div class="w-96 flex-col gap-3 pr-4 pt-4 bg-base-200 hidden lg:flex">
      <div class="card bg-base-100 rounded-md shadow-sm">
        <div class="card-body">
          <div class="card-title"> Search </div>
          <label class="input">
            <svg
              class="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              class="grow"
              value={props.search()} // call the signal
              onInput={(e) => props.onSearch(e.currentTarget.value)}
              placeholder="Search trainings..."
            />
          </label>
        </div>
      </div>
    </div>
  );
}
