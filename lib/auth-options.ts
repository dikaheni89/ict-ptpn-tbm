import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verify } from "@/lib/crypto";
import { JWT } from "next-auth/jwt";

export interface ICustomSession extends Session {
  id: string,
  group: string
}

export interface ICustomToken extends JWT {
  id: string
}

type CredentialsType = {
  username: string,
  password: string
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "username", placeholder: "username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        let user = null;
        let { username, password } = credentials as CredentialsType
        try {
          user = await prisma.user.findFirst({
            where: {
              username: username
            }
          })
        } catch (e) {
          throw new Error('Internal Server Error')
        }

        if (!user) {
          throw new Error('Username/Password Salah')
        }

        if (user.status !== 'ACTIVE') {
          let user_status = user.status.toLowerCase();
          user_status = user_status[0].toUpperCase() + user_status.substring(1);
          throw new Error(`Account ${user_status}, Please contact your administrator to activate your account`)
        }

        if (!verify(password, user.password)) {
          throw new Error('Email/Password Salah')
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          groupId: user.groupId
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login"
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token: _token, user }) => {
      let token = _token as ICustomToken;

      if (user) {
        token.id = user.id
      }

      if (token?.id || user?.id) {
        let isValidUser = await validateUser(token.id || user.id);
        if (!isValidUser) {
          throw new Error('Invalid Token')
        }
      } else {
        throw new Error('Invalid Token')
      }

      return token
    },
    session: async ({ token: _token, session: _session }) => {
      let token = _token as ICustomToken;
      let session = _session as ICustomSession;

      if (token) {
        session.id = token.id
      }

      if (token?.id || session?.id) {
        let isValidUser = await validateUser(token.id || session.id);
        if (!isValidUser) {
          throw new Error('Invalid Session')
        }
      } else {
        throw new Error('Invalid Session')
      }

      const user = await prisma.user.findFirst({
        where: {
          id: session.id
        },
        select: {
          name: true,
          username: true,
          email: true,
          group: {
            select: {
              name: true
            }
          }
        }
      });

      session.group = user?.group.name || "";
      if (session.user) {
        session.user.name = user?.name || "";
        session.user.email = user?.email || "";
      }

      return session;
    }
  },
  debug: process.env.NODE_ENV == "development",
  useSecureCookies: process.env.NEXTAUTH_SECURE_COOKIES == 'true',
}

async function validateUser(userId: string) {
  let user = await prisma.user.findFirst({
    where: {
      status: 'ACTIVE',
      id: userId
    }
  });

  return !!user
}