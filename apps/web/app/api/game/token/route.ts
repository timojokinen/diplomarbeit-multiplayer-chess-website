import { prisma } from "@/db";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const EXPIRES_IN = "2m";

export async function POST() {
  const session = await getServerSession(authOptions);
  const secret = process.env.TOKEN_SECRET!;

  if (!session) {
    const payload = { anonymous: true };
    const accessToken = jwt.sign(payload, secret, {
      expiresIn: EXPIRES_IN,
    });

    return NextResponse.json({ accessToken });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });

  if (!user) {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  const payload = { userId: user.id };
  const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
    expiresIn: EXPIRES_IN,
  });

  return NextResponse.json({ accessToken });
}
