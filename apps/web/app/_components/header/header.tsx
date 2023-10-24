import Link from "next/link";
import MainNavigation from "./main-navigation";
import UserProfile from "./user-profile";

export default function Header() {
  return (
    <div className="border-b mb-8 bg-white 2xl:mb-12">
      <header className="container py-2 flex items-center gap-8 justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="scroll-m-20 text-2xl font-bold font-serif tracking-tight transition-colors">
              KnightShift
            </h1>
          </Link>
          <MainNavigation></MainNavigation>
        </div>
        <UserProfile></UserProfile>
      </header>
    </div>
  );
}
