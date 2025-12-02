// // "use client";
// // import Link from "next/link";

// // export default function ExperimentsSection({ experiments = [] }) {
// //   if (!experiments.length) {
// //     return (
// //       <div className="rounded-xl border bg-white p-8 text-center text-gray-500 shadow-sm">
// //         No experiments found.
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
// //       {experiments.map((exp) => (
// //         <Link
// //           key={exp.name}
// //           href={`/experiments/${exp.name}`}
// //           className="block rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
// //         >
// //           <h3 className="text-lg font-semibold">{exp.name}</h3>
// //           <p className="text-sm text-gray-600 mt-1">
// //             {exp.sims?.length ?? 0} simulations
// //           </p>
// //           <p className="text-xs text-gray-400 mt-2">
// //             Click to view configurations and charts
// //           </p>
// //         </Link>
// //       ))}
// //     </div>
// //   );
// // }

// "use client";
// import Link from "next/link";

// function CalendarIcon(props) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       width="20"
//       height="20"
//       aria-hidden="true"
//       {...props}
//     >
//       <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM7 6H5a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1h-2v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6Z" />
//     </svg>
//   );
// }

// export default function ExperimentsList({
//   experiments = [],
//   counts = {},
//   showDashboardCard = true,
// }) {
//   return (
//     <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {showDashboardCard && (
//         <li>
//           <Link
//             href="/dashboard"
//             className="group block rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm transition hover:shadow-md"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-indigo-900">
//                 <span className="rounded-lg bg-white p-2 text-indigo-600 border border-indigo-200">
//                   📊
//                 </span>
//                 <div className="font-semibold group-hover:text-indigo-700">
//                   Dashboard
//                 </div>
//               </div>
//               <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
//                 Drop CSVs
//               </span>
//             </div>
//             <div className="mt-3 text-sm text-indigo-900/80">
//               Drag & drop CSVs to quickly visualize
//             </div>
//             <div className="mt-4 flex items-center justify-end">
//               <span className="text-indigo-700 text-sm font-medium">Open</span>
//             </div>
//           </Link>
//         </li>
//       )}

//       {experiments.length === 0 ? (
//         <li className="col-span-full">
//           <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
//             <h2 className="text-lg font-semibold">No experiments found</h2>
//             <p className="mt-1 text-sm text-gray-600">
//               Make sure <code>DATA_DIR</code> points to your data folder and
//               restart the dev server.
//             </p>
//           </div>
//         </li>
//       ) : (
//         experiments.map((date) => (
//           <li key={date}>
//             <Link
//               href={`/experiments/${date}`}
//               className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-gray-800">
//                   <span className="rounded-lg bg-gray-100 p-2 text-gray-600">
//                     <CalendarIcon className="fill-current" />
//                   </span>
//                   <div className="font-semibold group-hover:text-indigo-600">
//                     {date}
//                   </div>
//                 </div>
//                 <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
//                   {counts[date] ?? "—"} sims
//                 </span>
//               </div>
//               <div className="mt-3 text-sm text-gray-500">
//                 Click to view managers, configs, and charts.
//               </div>
//               <div className="mt-4 flex items-center justify-end">
//                 <span className="text-indigo-600 text-sm font-medium">Open</span>
//               </div>
//             </Link>
//           </li>
//         ))
//       )}
//     </ul>
//   );
// }

"use client";
import Link from "next/link";

export default function ExperimentsList({ experiments = [] }) {
  if (!experiments.length)
    return (
      <div className="text-center p-10 text-gray-500">
        No experiments found.
      </div>
    );

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {experiments.map((date) => (
        <li key={date}>
          <Link
            href={`/experiments/${date}`}
            className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="font-semibold text-gray-800">{date}</div>
            <div className="mt-1 text-sm text-gray-500">
              Click to view managers & charts
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
