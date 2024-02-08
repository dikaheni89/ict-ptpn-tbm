"use client"

import * as React from "react"
import Loader from "../public/static/loader/loader.gif"
import Image from 'next/image';

export default function Loading() {
  return (
    <>
      <div className="relative top-52 flex justify-center">
        <Image src={Loader} alt="logo" width={100} height={100} />
      </div>
    </>
  )
}
