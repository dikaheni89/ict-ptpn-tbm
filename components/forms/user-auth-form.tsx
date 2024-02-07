"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { redirect, useSearchParams } from "next/navigation";
import { signIn, SignInResponse, useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import Loading from "@/app/loading";

const formSchema = z.object({
  username: z.string().min(5,{ message: "Username Minimal 5 Karakter" }),
  password: z.string().min(6, { message: "Password Minimal 6 Karakter" })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? '/dashboard';
  const [loading, setLoading] = useState(false);
  const [globalLoading, setglobalLoading] = useState(false);
  const defaultValues = {
    username: "",
    password: "",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormValue) => {
    let username = data.username;
    let password = data.password;
    try {
      setLoading(true);
      let response: SignInResponse | undefined = await signIn("credentials", {
        username,
        password,
        redirect: false
      });

      if (!response?.error) {
        toast({
          title: "Login Berhasil",
          description: "Anda akan diarahkan ke halaman Dashboard"
        });

        // window.location.href = callbackUrl;
      } else {
        setLoading(false);
        toast({
          title: "Login Gagal",
          description: response?.error
        })
      }
    } catch (e) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak diketahui, silahkan coba lagi"
      })
    }
  };

  let session = useSession();

  if (session.status !== 'loading') {
    if (session.status === 'authenticated') {
      return redirect(callbackUrl)
    }

    if (globalLoading) {
      setglobalLoading(false)
    }
  }

  return (
    <>
      {globalLoading && (
        <Loading />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="username"
                    placeholder="Masukan Username Anda..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Masukan Password Anda..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto w-full bg-green-950" type="submit">
            Login
          </Button>
        </form>
      </Form>
    </>
  );
}
