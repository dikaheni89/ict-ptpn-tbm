"use client"

import { object, string } from "yup";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bulan, Caturwulan, Jenis, Minggu } from "@/constants/data";
import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useFormik } from "formik";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { ResponseData } from "@/lib/response-api";


type FormAddPekerjaanProps = {
  pekerjaanId: string
  caturwulan: Caturwulan[],
  bulan: Bulan[],
  minggu: Minggu[],
  jenis: Jenis[]
}

const schemaValidation = {
  caturwulan: string().typeError('Triwulan tidak valid').required('Triwulan Tidak Boleh Kosong'),
  bulan: string().typeError('Bulan tidak valid').required('Bulan tidak boleh kosong'),
  keterangan: string().typeError('keterangan tidak valid').required('Keterangan Tidak Boleh Kosong'),
}

export default function FormAddPekerjaan(props: FormAddPekerjaanProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    validationSchema: object().shape(schemaValidation),
    initialValues: {
      pekerjaanId: props.pekerjaanId,
      caturwulan: '',
      bulan: '',
      minggu: '',
      jenis: '',
      keterangan: ''
    },
    onSubmit: async (values, { setErrors }) => {
      try {
        const confirm = withReactContent(Swal)
        let { isConfirmed } = await confirm.fire({
          icon: 'warning',
          title: 'Simpan Data?',
          showCancelButton: true,
          confirmButtonText: 'Ya',
          confirmButtonColor: '#2b6cb0',
          cancelButtonText: 'Batal'
        });

        if (!isConfirmed) return;

        setLoading(true);
        let payload = { ...values }


        let response_api = await fetch('/api/tbm', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        setLoading(false);
        let response: ResponseData = await response_api.json();
        if (!response?.error) {
          await confirm.fire({
            icon: 'success',
            title: "Berhasil Menyimpan Data TBM",
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#2b6cb0'
          });

          window.location.href = '/dashboard/standar';

        } else {
          setLoading(false);
          setErrors(response.errors);
          //@ts-ignore
          toast({
            title: response?.error,
            description: 'Gagal menyimpan data'
          })
        }
      } catch (e) {
        setLoading(false);
        //@ts-ignore
        toast({
          title: "Error",
          description:
            "Terjadi kesalahan yang tidak diketahui, silahkan coba lagi",
        });
      }
    }
  })

  const { errors, values, handleChange, handleSubmit, setFieldValue } = formik;

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={'Tambah USer'} description={'Tambah User Baru'} />
      </div>
      <Separator />
      <form onSubmit={handleSubmit} method={'POST'} noValidate className="space-y-10 w-full">
        <div className="md:grid md:grid-cols-3 gap-8">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Pilih Triwulan</Label>
            <Select
              name={'caturwulan'}
              value={values.caturwulan}
              onValueChange={(value) =>
                setFieldValue("caturwulan", value)
              }
            >
              <SelectTrigger className="w-[340px]">
                <SelectValue placeholder="Pilih Caturwulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Caturwulan</SelectLabel>
                  {props.caturwulan.map((item) => (
                    <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Pilih Bulan</Label>
            <Select
              name={'bulan'}
              value={values.bulan}
              onValueChange={(value) =>
                setFieldValue("bulan", value)
              }
            >
              <SelectTrigger className="w-[340px]">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Bulan</SelectLabel>
                  {props.bulan.map((item) => (
                    <SelectItem key={item.namabulan} value={item.namabulan}>{item.namabulan}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Pilih Minggu</Label>
            <Select
              name={'minggu'}
              value={values.minggu}
              onValueChange={(value) =>
                setFieldValue("minggu", value)
              }
            >
              <SelectTrigger className="w-[340px]">
                <SelectValue placeholder="Pilih Minggu" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Minggu</SelectLabel>
                  {props.minggu.map((item) => (
                    <SelectItem key={item.namaminggu} value={item.namaminggu}>{item.namaminggu}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Pilih Jenis</Label>
            <Select
              name={'jenis'}
              value={values.jenis}
              onValueChange={(value) =>
                setFieldValue("jenis", value)
              }
            >
              <SelectTrigger className="w-[340px]">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Jenis</SelectLabel>
                  {props.jenis.map((item) => (
                    <SelectItem key={item.namajenis} value={item.namajenis}>{item.namajenis}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Keterangan</Label>
            <Input type={"text"} id={"keterangan"} name={'keterangan'} value={values.keterangan} onChange={handleChange}
                   placeholder="Masukan Inputan Berdasarkan Jenis Inputan" required />
            {!!errors.keterangan && (
              <span className={'text-red-700 font-semibold text-xs'}>{errors.keterangan}</span>
            )}
          </div>
        </div>
        <Button disabled={loading} className="ml-auto" type={'submit'}>
          Simpan
        </Button>
      </form>
    </>
  );
}