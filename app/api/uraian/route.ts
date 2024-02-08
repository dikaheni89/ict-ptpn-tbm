import { ICustomToken } from "@/lib/auth-options";
import { sendResponseErrorValidation, validateAdminModuleAccess, validateSession } from "@/lib/authHelper";
import { ResponseData, ResponseMessage, ResponseTable } from "@/lib/response-api";
import { errorWithKeys } from "@/lib/utilsHelper";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { number, object, string } from "yup";
import { Prisma } from "@prisma/client";
import PekerjaanWhereInput = Prisma.PekerjaanWhereInput;
import PekerjaanUpdateInput = Prisma.PekerjaanUpdateInput;
import PekerjaanUncheckedUpdateInput = Prisma.PekerjaanUncheckedUpdateInput;
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Uraian Pekerjaan';
  let tokenStandar = await getToken({ req }) as ICustomToken;
  let isHasAccessStandar = await validateAdminModuleAccess(tokenStandar.id, moduleName, 'READ');
  if (!isHasAccessStandar) {
    return NextResponse.json(new ResponseMessage({
      status: 'error',
      message: 'User tidak memiliki akses modul',
      code: 403
    }), { status: 403 })
  }

  const urlParamsSchema = object().shape({
    page: number().optional().integer().min(1),
    pageSize: number().optional().integer().min(10).max(100),
    orderBy: string().optional().oneOf(['uraian', 'createdAt']),
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

//   CREATE SEARCH AND FILTER START
  let whereClause: PekerjaanWhereInput = {};

  if (validatedRequest.search) {
    whereClause.OR = [
      {
        uraian: {
          contains: validatedRequest.search,
          mode: "insensitive"
        }
      },
      {
        fisik: {
          contains: validatedRequest.search,
          mode: "insensitive"
        }
      },
      {
        kodereg: {
          id: {
            contains: validatedRequest.search,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  const _standar = await prisma.pekerjaan.findMany({
    where: whereClause,
    orderBy: query_orderBy,
    skip: ((validatedRequest.page || 1) - 1) * (validatedRequest.pageSize || 10),
    take: validatedRequest.pageSize || 10,
    select: {
      id: true,
      kodereg: {
        select: {
          id: true,
          kode: true,
          name: true
        }
      },
      rek: true,
      uraian: true,
      fisik: true,
      norma: true,
      rotasi: true,
      keterangan: true,
    }
  });

  const standar = _standar.map((item) => {
    return {
      id: item.id,
      idreg: item.kodereg.id,
      kodereg: item.kodereg.kode,
      rek: item.rek,
      uraian: item.uraian,
      fisik: item.fisik,
      norma: item.norma,
      rotasi: item.rotasi,
      keterangan: item.keterangan
    }
  });

  let countPekerjaan = await prisma.pekerjaan.count({
    where: whereClause
  })

  return NextResponse.json(new ResponseData({
    data: new ResponseTable({
      rows: standar,
      total_data: countPekerjaan
    })
  }))
}

export async function POST(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Uraian Pekerjaan';
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
    uraian: string().required('Uraian Pekerjaan harus diisi'),
    fisik: string().required('Fisik Pekerjaan harus diisi'),
    norma: string().required('Norma Pekerjaan harus diisi'),
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

  let kodeRegs = await prisma.kodeReg.findUnique({
    where: {
      id: body.kodereg
    }
  })

  if (!kodeRegs) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        group: 'Kode Rekening tidak ditemukan'
      }
    }), { status: 400 })
  }

  let pekerjaan = await prisma.pekerjaan.create({
    data: {
      koderegId: kodeRegs.id,
      rek: body.rek,
      uraian: validatedBody.uraian,
      fisik: validatedBody.fisik,
      norma: validatedBody.norma,
      rotasi: body.rotasi,
      keterangan: body.keterangan
    }
  });

  return NextResponse.json(new ResponseData({
    data: pekerjaan
  }));
}

export async function PUT(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Uraian Pekerjaan'
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
    pekerjaanId: string().required('Pekerjaan ID harus diisi').uuid('Pekerjaan ID tidak valid'),
    uraian: string().required('Uraian Pekerjaan harus diisi'),
    fisik: string().required('Fisik Pekerjaan harus diisi'),
    norma: string().required('Norma Pekerjaan harus diisi'),
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

  let kodeRegs = await prisma.kodeReg.findUnique({
    where: {
      id: body.kodereg
    }
  })

  if (!kodeRegs) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: {
        group: 'Kode Rekening tidak ditemukan'
      }
    }), { status: 400 })
  }

  let pekerjaan = await prisma.pekerjaan.findUnique({
    where: {
      id: validatedBody.pekerjaanId
    }
  });

  if (!pekerjaan) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'Kode Rekening tidak ditemukan'
    }), { status: 404 })
  }

  const updatedData: PekerjaanUpdateInput | PekerjaanUncheckedUpdateInput = {
    koderegId: kodeRegs.id,
    rek: body.rek,
    uraian: validatedBody.uraian,
    fisik: validatedBody.fisik,
    norma: validatedBody.norma,
    rotasi: body.rotasi,
    keterangan: body.keterangan
  }

  await prisma.pekerjaan.update({
    where: {
      id: pekerjaan.id
    },
    data: updatedData
  });

  return NextResponse.json(new ResponseMessage({
    message: 'Uraian Pekerjaan berhasil Update'
  }));
}

export async function DELETE(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Uraian Pekerjaan'
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
    pekerjaanId: string().required('Pekerjaan ID harus diisi').uuid('Pekerjaan ID tidak valid')
  });

  const urlParams = req.nextUrl.searchParams;
  const pekerjaanId = urlParams.get('pekerjaanId');
  

  // VALIDATE BODY START
  let validatedRequest = null;
  try {
    validatedRequest = await bodySchema.validate({ pekerjaanId }, { abortEarly: false });
  } catch (e: any) {
    return NextResponse.json(new ResponseMessage({
      code: 400,
      status: 'error',
      error: 'ValidationError',
      errors: errorWithKeys(e)
    }), { status: 400 })
  }
  // VALIDATE BODY END

  let pekerjaan = await prisma.pekerjaan.findUnique({
    where: {
      id: validatedRequest.pekerjaanId
    }
  });

  if (!pekerjaan) {
    return NextResponse.json(new ResponseMessage({
      code: 404,
      status: 'error',
      error: 'Uraian Pekerjaan tidak ditemukan'
    }), { status: 404 })
  }

  await prisma.pekerjaan.delete({
    where: {
      id: pekerjaan.id
    }
  });

  return NextResponse.json(new ResponseMessage({
    message: 'Uraian Pekerjaan berhasil dihapus'
  }));
}