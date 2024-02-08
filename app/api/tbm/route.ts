import { NextRequest, NextResponse } from "next/server";
import { sendResponseErrorValidation, validateAdminModuleAccess, validateSession } from "@/lib/authHelper";
import { getToken } from "next-auth/jwt";
import { ICustomToken } from "@/lib/auth-options";
import { ResponseData, ResponseMessage } from "@/lib/response-api";
import { object, string } from "yup";
import { errorWithKeys } from "@/lib/utilsHelper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await validateSession(req);
  } catch (e: any) {
    return sendResponseErrorValidation(e);
  }

  const moduleName = 'Standar Fisik'
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
    pekerjaanId: string().required('Pekerjaan harus diisi'),
    caturwulan: string().required('Caturwulan harus diisi'),
    bulan: string().required('Bulan harus diisi'),
    minggu: string().required('Minggu Harus diisi'),
    jenis: string().required('Jenis harus diisi'),
    keterangan: string().required('Keterangan Harus diisi')
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

  let tbm = await prisma.luasTbm.create({
    data: {
      pekerjaanId: validatedBody.pekerjaanId,
      caturwulan: validatedBody.caturwulan,
      bulan: validatedBody.bulan,
      minggu: validatedBody.minggu,
      jenis: validatedBody.jenis,
      keterangan: validatedBody.keterangan
    }
  });

  return NextResponse.json(new ResponseData({
    data: tbm
  }));
}