import ColyseusProvider from "@/components/colyseus-context";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ColyseusProvider>
      <div className="container mx-auto">{children}</div>
    </ColyseusProvider>
  );
}
