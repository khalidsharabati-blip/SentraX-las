import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { userRoles: { include: { role: true } } },
        });

        if (!user || !user.isActive) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: String(user.id),
          name: user.fullName,
          email: user.email,
          role: user.userRoles[0]?.role?.name || "viewer",
          language: user.language,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/he/login" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("/login")) return url;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + "/he/login";
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
        token.language = (user as any).language;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).language = token.language;
      }
      return session;
    },
  },
};
