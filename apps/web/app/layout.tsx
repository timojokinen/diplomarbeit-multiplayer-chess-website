import "./globals.css";
import Header from "./_components/header";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50">
        <NextTopLoader
          shadow={false}
          showSpinner={false}
          color="#6366f1"
          height={2}
        />
        <Header />
        <div className="container mx-auto">{children}</div>
      </body>
    </html>
  );
}
