/* eslint-disable no-console */
"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"
import { ResponseData } from "@/lib/response-api"
import { useFormik } from "formik"
import { useState } from "react"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { object, string } from "yup"

type InitialValuesType = {
    rekeningId: string,
    kode: string,
    name: string,
}

type FormDetailRekeningProps = {
    mode?: 'create' | 'edit' | 'view',
    initialValues?: InitialValuesType
}

const schemaValidation = {
    kode: string().typeError('Kode Rekening tidak valid').required('Kode Rekening Tidak Boleh Kosong'),
    name: string().typeError('Nama Rekening tidak valid').required('Nama Rekening tidak boleh kosong')
}

export default function FormDetailRekening(props: FormDetailRekeningProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const mode = props.mode || 'create';

    const formik = useFormik({
        validationSchema: object().shape(schemaValidation),
        initialValues: { ...props.initialValues, password: undefined } || {
            kode: '',
            name: '',
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

                let response_api = await fetch('/api/rekening', {
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

                    window.location.href = '/dashboard/rekening';

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

    const { errors, values, handleChange, handleSubmit } = formik;

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={'Tambah Kode Rekening'} description={'Tambah Kode Rekening Baru'} />
            </div>
            <Separator />
            <form onSubmit={handleSubmit} method={'POST'} noValidate className="space-y-10 w-full">
                <div className="md:grid md:grid-cols-2 gap-8">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Kode Rekening</Label>
                        <Input type={"text"} id={"kode"} name={'kode'} value={values.kode} onChange={handleChange}
                               placeholder="Masukan Kode Rekening" required />
                        {!!errors.kode && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.kode}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Nama Rekening</Label>
                        <Input type={"text"} id={"name"} name={'name'} value={values.name} onChange={handleChange}
                               placeholder="Masukan Rekening" required />
                        {!!errors.name && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.name}</span>
                        )}
                    </div>
                </div>
                <Button disabled={loading} className="ml-auto" type={'submit'}>
                    Simpan
                </Button>
            </form>
        </>
    )
}

