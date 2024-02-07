import { options as AuthOptions } from "@/lib/auth-options";
import NextAuth from "next-auth/next";

const handler = NextAuth(AuthOptions);

export { handler as GET, handler as POST };
