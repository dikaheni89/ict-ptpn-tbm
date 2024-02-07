import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ICustomToken } from "@/lib/auth-options";
import { ResponseMessage } from "@/lib/response-api";
import { Prisma } from ".prisma/client";
import UserGroupAdminModuleWhereInput = Prisma.UserGroupAdminModuleWhereInput;

export async function validateAdminModuleAccess(userId: string, moduleName: string, permission: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' = "READ"): Promise<Boolean> {
  const whereClause: UserGroupAdminModuleWhereInput = {
    group: {
      User: {
        some: {
          id: userId,
          status: 'ACTIVE'
        }
      }
    },
    module: {
      name: moduleName
    }
  }

  if (permission === 'READ') {
    whereClause.read = true;
  }

  if (permission === 'CREATE') {
    whereClause.create = true;
  }

  if (permission === 'UPDATE') {
    whereClause.update = true;
  }

  if (permission === 'DELETE') {
    whereClause.delete = true;
  }

  const isHasAccess = await prisma.userGroupAdminModule.findFirst({
    where: whereClause,
    select: {
      id: true
    }
  });

  return !!isHasAccess
}

export async function getUserAdminModulePermission(userId: string, moduleName: string) {
  const permission = await prisma.userGroupAdminModule.findFirst({
    where: {
      group: {
        User: {
          some: {
            id: userId,
            status: 'ACTIVE'
          }
        }
      },
      module: {
        name: moduleName
      }
    },
    select: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
  });

  return permission || {
    create: false,
    read: false,
    update: false,
    delete: false
  }
}

export async function validateSession(req: NextRequest) {
  let token = await getToken({ req }) as ICustomToken | null;

  if (!token) {
    throw new Error('INVALID_TOKEN')
  }

  // GET DETAIL USER
  let user = await prisma.user.findFirst({
    where: {
      id: token.sub,
      status: 'ACTIVE'
    }
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  return true
}

export function sendResponseErrorValidation(error: Error) {
  if (error.message === 'INVALID_TOKEN') {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'AccessTokenInvalid',
      code: 403
    }), { status: 403 })
  }

  if (error.message === 'USER_NOT_FOUND') {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'SessionInvalid',
      code: 403
    }), { status: 403 })
  }

  return NextResponse.json(new ResponseMessage({
    status: 'error',
    error: 'InternalServerError',
    code: 500
  }), { status: 500 })
}
