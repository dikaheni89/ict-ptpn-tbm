import { ICustomToken } from "@/lib/auth-options";
import { sendResponseErrorValidation, validateAdminModuleAccess, validateSession } from "@/lib/authHelper";
import { ResponseData, ResponseMessage, ResponseTable } from "@/lib/response-api";
import { errorWithKeys } from "@/lib/utilsHelper";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { number, object, string } from "yup";
import { Prisma } from "@prisma/client";
import PekerjaanWhereInput = Prisma.PekerjaanWhereInput;
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Standar Fisik';
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
