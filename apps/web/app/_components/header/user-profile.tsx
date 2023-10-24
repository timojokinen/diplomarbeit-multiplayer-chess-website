import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UserProfile() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <Avatar asChild className="rounded-lg">
        <Link href="/profile">
          {session.user?.image && (
            <AvatarImage src={session.user?.image}></AvatarImage>
          )}
          <AvatarFallback>
            {session.user?.name?.[0]}
          </AvatarFallback>
        </Link>
      </Avatar>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button asChild>
        <Link href="/api/auth/signin">Join now</Link>
      </Button>
    </div>
  );
}
