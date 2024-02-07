/* eslint-disable no-console */
"use client"

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"
import { ResponseData } from "@/lib/response-api"
import { useFormik } from "formik"
import { useState } from "react"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { object, string } from "yup"
import { Status } from "@prisma/client";

type InitialValuesType = {
    userId: string,
    username: string,
    name: string,
    email: string,
    group: string,
    status: Status,
}

type FormDetailUserProps = {
    mode?: 'create' | 'edit' | 'view',
    groups: {
        id: string,
        name: string
    }[],
    initialValues?: InitialValuesType
}

const schemaValidation = {
    username: string().typeError('USername tidak valid').required('Nama Tidak Boleh Kosong'),
    name: string().typeError('Nama tidak valid').required('Nama tidak boleh kosong'),
    email: string().email('Email tidak valid').required('Email tidak boleh kosong'),
    password: string().optional().typeError('Password tidak valid').min(5, 'Password minimal 5 karakter')
}

export default function FormDetailUser(props: FormDetailUserProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const mode = props.mode || 'create';

    if (mode === 'create') {
        schemaValidation.password = string().typeError('Password tidak valid').required('Password tidak boleh kosong').min(5, 'Password minimal 5 karakter')
    }

    const formik = useFormik({
        validationSchema: object().shape(schemaValidation),
        initialValues: { ...props.initialValues, password: undefined } || {
            username: '',
            name: '',
            email: '',
            status: 'ACTIVE',
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
                if (!payload.password) {
                    payload.password = undefined;
                }

                let response_api = await fetch('/api/user', {
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

                    window.location.href = '/dashboard/user';

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
                <Heading title={'Tambah USer'} description={'Tambah User Baru'} />
            </div>
            <Separator />
            <form onSubmit={handleSubmit} method={'POST'} noValidate className="space-y-10 w-full">
                <div className="md:grid md:grid-cols-3 gap-8">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Username</Label>
                        <Input type={"text"} id={"username"} name={'username'} value={values.username} onChange={handleChange}
                               placeholder="Masukan Username Anda" required />
                        {!!errors.name && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.name}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Nama Lengkap</Label>
                        <Input type={"text"} id={"name"} name={'name'} value={values.name} onChange={handleChange}
                               placeholder="Masukan Nama Lengkap Anda" required />
                        {!!errors.name && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.name}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Alamat E-mail</Label>
                        <Input type={"email"} id={"email"} name={'email'} value={values.email} onChange={handleChange}
                               placeholder="Masukan Alamat E-mail Anda" required />
                        {!!errors.email && (
                          <span className={'text-red-700 font-semibold text-xs'}>{errors.email}</span>
                        )}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Password</Label>
                        <Input type={"password"} id={"password"} name={'password'} value={values.password}
                               onChange={handleChange} placeholder="Masukan Password Anda" required />
                        {mode === 'edit' &&
                          <p className="text-sm text-red-500">Kosongkan jika tidak ingin mengubah password</p>}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>User Group</Label>
                        <Select
                          name={'group'}
                          value={values.group}
                          onValueChange={(value) =>
                            setFieldValue("group", value)
                          }
                        >
                            <SelectTrigger className="w-[340px]">
                                <SelectValue placeholder="Pilih User Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>User Group</SelectLabel>
                                    {props.groups.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Status User</Label>
                        <Select
                          name={'status'}
                          value={values.status}
                          onValueChange={(value) =>
                            setFieldValue("status", value)
                          }
                        >
                            <SelectTrigger className="w-[340px]">
                                <SelectValue placeholder="Pilih Status User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status User</SelectLabel>
                                    {Object.keys(Status).map(status => (
                                      <SelectItem key={status}
                                                  value={status}>{status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button disabled={loading} className="ml-auto" type={'submit'}>
                    Simpan
                </Button>
            </form>
        </>
    )
}

