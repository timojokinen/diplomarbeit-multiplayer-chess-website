import { Session as NextAuthSession } from "next-auth";

declare module "next-auth" {
  interface Session extends NextAuthSession {
    user?: {
      name?: string | null;
      id: string;
      email?: string | null;
      image?: string | null;
    };
    expires: ISODateString;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
  }
}
