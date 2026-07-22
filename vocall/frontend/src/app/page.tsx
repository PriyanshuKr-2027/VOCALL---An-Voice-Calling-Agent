export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary mb-4">
        VoCall
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        Open-Source Voice Agent Platform — Low-latency, real-time voice orchestration.
      </p>
      <div className="flex gap-4">
        <a
          href="/docs"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
        >
          Documentation
        </a>
      </div>
    </main>
  );
}
