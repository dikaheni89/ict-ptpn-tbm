/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICustomToken } from "@/lib/auth-options";
import { sendResponseErrorValidation, validateAdminModuleAccess, validateSession } from "@/lib/authHelper";
import { ResponseData, ResponseMessage, ResponseTable } from "@/lib/response-api";
import { errorWithKeys } from "@/lib/utilsHelper";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { number, object, string } from "yup";
import { Prisma, Status } from "@prisma/client";
import moment from "moment-timezone";
import UserWhereInput = Prisma.UserWhereInput;
import UserUpdateInput = Prisma.UserUpdateInput;
import UserUncheckedUpdateInput = Prisma.UserUncheckedUpdateInput;
import { prisma } from "@/lib/prisma";
import { hash } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Management User'
  let token = await getToken({ req }) as ICustomToken;
  let isHasAccess = await validateAdminModuleAccess(token.id, moduleName, 'READ');
  if (!isHasAccess) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      message: 'User tidak memiliki akses modul',
      code: 403
    }), { status: 403 })
  }

  const urlParamsSchema = object().shape({
    page: number().optional().integer().min(1),
    pageSize: number().optional().integer().min(10).max(100),
    orderBy: string().optional().oneOf(['name', 'createdAt']),
    orderDirection: string().optional().oneOf(['asc', 'desc']),
    search: string().optional().trim()
  });

  // PARSE QUERY PARAMS START
  const queryParam = req.nextUrl.searchParams;
  const pageSize = Number(queryParam.get('pageSize')) || 10;
  const page = Number(queryParam.get('page')) || 1;
  const orderBy = queryParam.get('orderBy') || 'reportTime';
  const orderDirection = queryParam.get('orderDirection') || 'desc';
  const search = queryParam.get('search') || undefined;
  // PARSE QUERY PARAMS END

  // VALIDATE QUERY PARAMS START
  let validatedRequest = null;
  try {
    validatedRequest = await urlParamsSchema.validate({
      pageSize,
      page,
      orderBy,
      orderDirection,
      search
    }, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE QUERY PARAMS END

  let query_orderBy: { [key: string]: string } = {}
  query_orderBy[orderBy] = orderDirection;

  // CREATE SEARCH AND FILTER START
  let whereClause: UserWhereInput = {}

  if (validatedRequest.search) {
    whereClause.OR = [
      {
        name: {
          contains: validatedRequest.search,
          mode: 'insensitive'
        }
      },
      {
        email: {
          contains: validatedRequest.search,
          mode: 'insensitive'
        }
      },
      {
        group: {
          name: {
            contains: validatedRequest.search,
            mode: 'insensitive'
          }
        }
      }
    ];
  }

  const _users = await prisma.user.findMany({
    where: whereClause,
    orderBy: query_orderBy,
    skip: ((validatedRequest.page || 1) - 1) * (validatedRequest.pageSize || 10),
    take: validatedRequest.pageSize || 10,
    select: {
      id: true,
      name: true,
      email: true,
      group: {
        select: {
          name: true
        }
      },
      createdAt: true
    }
  });

  const users = _users.map((item) => {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      group: item.group.name,
      createdAt: moment(item.createdAt).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    }
  });

  let countUser = await prisma.user.count({
    where: whereClause
  })

  return NextResponse.json(new ResponseData({
    data: new ResponseTable({
      rows: users,
      total_data: countUser
    })
  }))

}

export async function POST(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Management User'
  let token = await getToken({ req }) as ICustomToken;
  let isHasAccess = await validateAdminModuleAccess(token.id, moduleName, 'CREATE');
  if (!isHasAccess) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'ForbiddenAccess',
      code: 403
    }), { status: 403 });
  }

  const bodySchema = object().shape({
    username: string().required('Username harus diisi'),
    name: string().required('Nama harus diisi'),
    email: string().required('Email harus diisi').email('Format email tidak valid'),
    password: string().required('Password harus diisi').min(5, 'Password minimal 5 karakter'),
    group: string().required('Group harus diisi').uuid('Group tidak valid'),
    status: string().required('Status harus diisi').oneOf(Object.keys(Status), 'Status tidak valid')
  });

  // PARSE BODY START
  let body = null;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'BadRequest',
      message: 'request payload tidak valid',
      code: 400
    }), { status: 400 });
  }
  // PARSE BODY END

  // VALIDATE BODY START
  let validatedBody = null;
  try {
    validatedBody = await bodySchema.validate(body, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE BODY END

  let group = await prisma.userGroup.findUnique({
    where: {
      id: validatedBody.group
    }
  })

  if (!group) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        group: 'Group tidak ditemukan'
      }
    }), { status: 400 })
  }

  // Check Email already exist?
  let isEmailExist = await prisma.user.findUnique({
    where: {
      email: validatedBody.email
    }
  });

  if (isEmailExist) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        email: 'Email sudah digunakan'
      }
    }), { status: 400 })
  }

  let user = await prisma.user.create({
    data: {
      username: validatedBody.username,
      name: validatedBody.name,
      email: validatedBody.email,
      password: hash(validatedBody.password),
      groupId: group.id,
      status: validatedBody.status as Status
    }
  });

  return NextResponse.json(new ResponseData({
    data: user
  }));
}

export async function PUT(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Management User'
  let token = await getToken({ req }) as ICustomToken;
  let isHasAccess = await validateAdminModuleAccess(token.id, moduleName, 'UPDATE');
  if (!isHasAccess) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'ForbiddenAccess',
      code: 403
    }), { status: 403 });
  }

  const bodySchema = object().shape({
    userId: string().required('User ID harus diisi').uuid('User ID tidak valid'),
    username: string().required('Username harus di isi'),
    name: string().required('Nama harus diisi'),
    email: string().required('Email harus diisi').email('Format email tidak valid'),
    password: string().typeError('Password tidak valid').optional().min(5, 'Password minimal 5 karakter'),
    group: string().required('Group harus diisi').uuid('Group tidak valid'),
    status: string().required('Status harus diisi').oneOf(Object.keys(Status), 'Status tidak valid')
  });

  // PARSE BODY START
  let body = null;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'BadRequest',
      message: 'request payload tidak valid',
      code: 400
    }), { status: 400 });
  }
  // PARSE BODY END

  // VALIDATE BODY START
  let validatedBody = null;
  try {
    validatedBody = await bodySchema.validate(body, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE BODY END

  let group = await prisma.userGroup.findUnique({
    where: {
      id: validatedBody.group
    }
  })

  if (!group) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        group: 'Group tidak ditemukan'
      }
    }), { status: 400 })
  }

  let user = await prisma.user.findUnique({
    where: {
      id: validatedBody.userId
    }
  });

  if (!user) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'User tidak ditemukan'
    }), { status: 404 })
  }

  // Check Email already exist?
  let isEmailExist = await prisma.user.findUnique({
    where: {
      email: validatedBody.email
    }
  });

  if (isEmailExist && isEmailExist.id !== user.id) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        email: 'Email sudah digunakan'
      }
    }), { status: 400 })
  }

  const updatedData: UserUpdateInput | UserUncheckedUpdateInput = {
    username: validatedBody.username,
    name: validatedBody.name,
    email: validatedBody.email,
    groupId: group.id,
    status: validatedBody.status as Status
  }

  if (validatedBody.password) {
    updatedData.password = hash(validatedBody.password)
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: updatedData
  });

  return NextResponse.json(new ResponseMessage({
    message: 'User berhasil Update'
  }));
}

export async function DELETE(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Management User'
  let token = await getToken({ req }) as ICustomToken;
  let isHasAccess = await validateAdminModuleAccess(token.id, moduleName, 'DELETE');
  if (!isHasAccess) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      error: 'ForbiddenAccess',
      code: 403
    }), { status: 403 });
  }

  const bodySchema = object().shape({
    userId: string().required('User ID harus diisi').uuid('User ID tidak valid')
  });

  const urlParams = req.nextUrl.searchParams;
  const userId = urlParams.get('userId');

  // VALIDATE BODY START
  let validatedRequest = null;
  try {
    validatedRequest = await bodySchema.validate({ userId }, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE BODY END

  let user = await prisma.user.findUnique({
    where: {
      id: validatedRequest.userId
    }
  });

  if (!user) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'User tidak ditemukan'
    }), { status: 404 })
  }

  await prisma.user.delete({
    where: {
      id: user.id
    }
  });

  return NextResponse.json(new ResponseMessage({
    message: 'User berhasil dihapus'
  }));
}