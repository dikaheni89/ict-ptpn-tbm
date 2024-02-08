/* eslint-disable no-console */
"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponseData } from "@/lib/response-api"
import { useFormik } from "formik"
import { useState } from "react"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { object, string } from "yup"

type InitialValuesType = {
    pekerjaanId: string,
    kodereg: string,
    rek: string,
    uraian: string,
    fisik: string,
    norma: string,
    rotasi: string,
    keterangan: string,
}

type FormDetailRekeningProps = {
    mode?: 'create' | 'edit' | 'view',
    kodeRegs: {
        id: string,
        name: string
    }[],
    initialValues?: InitialValuesType
}

const schemaValidation = {
    uraian: string().typeError('Uraian Pekerjaan tidak valid').required('Uraian Pekerjaan Tidak Boleh Kosong'),
    fisik: string().typeError('fisik Pekerjaan tidak valid').required('Fisik Pekerjaan tidak boleh kosong'),
    norma: string().typeError('norma Pekerjaan tidak valid').required('Norma Pekerjaan tidak boleh kosong'),
}

export default function FormDetailUraian(props: FormDetailRekeningProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const mode = props.mode || 'create';

    const formik = useFormik({
        validationSchema: object().shape(schemaValidation),
        initialValues: { ...props.initialValues, password: undefined } || {
            rek: '',
            uraian: '',
            fisik: '',
            norma: '',
            rotasi: '',
            keterangan: '',
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

                let response_api = await fetch('/api/uraian', {
                    method: mode === 'create' ? 'POST' : 'PUT',
                    body: JSON.stringify(payload)
                });

                setLoading(false);
                let response: ResponseData = await response_api.json();
                if (!response?.error) {
                    await confirm.fire({
                        icon: 'success',
                        title: "Berhasil Menyimpan Data",
                        confirmButtonText: 'Tutup',
                        confirmButtonColor: '#2b6cb0'
                    });

                    window.location.href = '/dashboard/uraian';

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
                console.error(e)
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
                <Heading title={'Tambah Uraian Pekerjaan'} description={'Tambah Uraian Pekerjaan Baru'} />
            </div>
            <Separator />
            <form onSubmit={handleSubmit} method={'POST'} noValidate className="space-y-10 w-full">
                <div className="md:grid md:grid-cols-3 gap-8">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Pilih Kode Rekening</Label>
                        <Select
                          name={'kodereg'}
                          value={values.kodereg}
                          onValueChange={(value) =>
                            setFieldValue("kodereg", value)
                          }
                        >
                            <SelectTrigger className="w-[340px]">
                                <SelectValue placeholder="Pilih Kode Rekening" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Kode Rekening</SelectLabel>
                                    {props.kodeRegs.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Rekening Pekerjaan</Label>
                        <Input type={"text"} id={"rek"} name={'rek'} value={values.rek} onChange={handleChange}
                               placeholder="Masukan Rekening Pekerjaan" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Uraian Pekerjaan</Label>
                        <Input type={"text"} id={"uraian"} name={'uraian'} value={values.uraian} onChange={handleChange}
                               placeholder="Masukan Uraian Rekening" required />
                        {!!errors.uraian && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.uraian}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Fisik Pekerjaan</Label>
                        <Input type={"text"} id={"fisik"} name={'fisik'} value={values.fisik} onChange={handleChange}
                               placeholder="Masukan Fisik Pekerjaan" required />
                        {!!errors.fisik && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.fisik}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Norma Pekerjaan</Label>
                        <Input type={"text"} id={"norma"} name={'norma'} value={values.norma} onChange={handleChange}
                               placeholder="Masukan Norma Pekerjaan" required />
                        {!!errors.norma && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.norma}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Rotasi Pekerjaan</Label>
                        <Input type={"text"} id={"rotasi"} name={'rotasi'} value={values.rotasi} onChange={handleChange}
                               placeholder="Masukan Rotasi Pekerjaan" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Keterangan Pekerjaan</Label>
                        <Input type={"text"} id={"keterangan"} name={'keterangan'} value={values.keterangan} onChange={handleChange}
                               placeholder="Masukan Keterangan Pekerjaan" />
                    </div>
                </div>
                <Button disabled={loading} className="ml-auto" type={'submit'}>
                    Simpan
                </Button>
            </form>
        </>
    )
}

