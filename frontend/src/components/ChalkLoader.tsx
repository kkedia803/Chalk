export default function ChalkLoader() {
  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black"
      role="status"
      aria-label="Loading Chalk"
    >
      <img
        src="/chalkIcon.webp"
        alt=""
        className="chalk-loader-pulse h-36 w-36 rounded-[22%] object-cover shadow-2xl shadow-blue-500/5"
      />
    </div>
  );
}
