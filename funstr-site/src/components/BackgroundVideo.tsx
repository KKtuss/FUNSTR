export function BackgroundVideo() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <video
        className="h-full w-full object-cover opacity-55"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Darken + vignette for readability */}
      <div className="absolute inset-0 bg-[#020313]/70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% 10%, rgba(2, 132, 199, 0.06), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(30, 64, 175, 0.06), transparent 55%), radial-gradient(1100px 800px at 50% 100%, rgba(8, 145, 178, 0.05), transparent 55%)",
        }}
      />
    </div>
  );
}


