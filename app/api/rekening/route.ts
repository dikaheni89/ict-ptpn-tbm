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
import KodeRegWhereInput = Prisma.KodeRegWhereInput;
import KodeRegUpdateInput = Prisma.KodeRegUpdateInput;
import KodeRegUncheckedUpdateInput = Prisma.KodeRegUncheckedUpdateInput;
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Kode Rekening'
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
  let whereClause: KodeRegWhereInput = {}

  if (validatedRequest.search) {
    whereClause.OR = [
      {
        name: {
          contains: validatedRequest.search,
          mode: 'insensitive'
        }
      },
      {
        kode: {
          contains: validatedRequest.search,
          mode: 'insensitive'
        }
      }
    ];
  }

  const _rekening = await prisma.kodeReg.findMany({
    where: whereClause,
    orderBy: query_orderBy,
    skip: ((validatedRequest.page || 1) - 1) * (validatedRequest.pageSize || 10),
    take: validatedRequest.pageSize || 10,
    select: {
      id: true,
      kode: true,
      name: true,
      createdAt: true
    }
  });

  const rekening = _rekening.map((item) => {
    return {
      id: item.id,
      kode: item.kode,
      name: item.name,
      createdAt: moment(item.createdAt).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    }
  });

  let countRekening = await prisma.kodeReg.count({
    where: whereClause
  })

  return NextResponse.json(new ResponseData({
    data: new ResponseTable({
      rows: rekening,
      total_data: countRekening
    })
  }))

}

export async function POST(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Kode Rekening'
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
    kode: string().required('Kode Rekening harus diisi'),
    name: string().required('Nama Rekening harus diisi'),
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

  let rekening = await prisma.kodeReg.create({
    data: {
      kode: validatedBody.kode,
      name: validatedBody.name,
    }
  });

  return NextResponse.json(new ResponseData({
    data: rekening
  }));
}

export async function PUT(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Kode Rekening'
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
    rekeningId: string().required('Rekening ID harus diisi').uuid('Rekening ID tidak valid'),
    kode: string().required('Kode Rekening harus di isi'),
    name: string().required('Nama Rekening harus diisi'),
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

  let rekening = await prisma.kodeReg.findUnique({
    where: {
      id: validatedBody.rekeningId
    }
  });

  if (!rekening) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'Kode Rekening tidak ditemukan'
    }), { status: 404 })
  }

  const updatedData: KodeRegUpdateInput | KodeRegUncheckedUpdateInput = {
    kode: validatedBody.kode,
    name: validatedBody.name
  }

  await prisma.kodeReg.update({
    where: {
      id: rekening.id
    },
    data: updatedData
  });

  return NextResponse.json(new ResponseMessage({
    message: 'Kode Rekening berhasil Update'
  }));
}

export async function DELETE(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Kode Rekening'
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
    rekeningId: string().required('Rekening ID harus diisi').uuid('Rekening ID tidak valid')
  });

  const urlParams = req.nextUrl.searchParams;
  const rekeningId = urlParams.get('rekeningId');
  

  // VALIDATE BODY START
  let validatedRequest = null;
  try {
    validatedRequest = await bodySchema.validate({ rekeningId }, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE BODY END

  let rekening = await prisma.kodeReg.findUnique({
    where: {
      id: validatedRequest.rekeningId
    }
  });

  if (!rekening) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'Kode Rekening tidak ditemukan'
    }), { status: 404 })
  }

  await prisma.kodeReg.delete({
    where: {
      id: rekening.id
    }
  });

  return NextResponse.json(new ResponseMessage({
    message: 'Kode Rekening berhasil dihapus'
  }));
}