"use client";

export default function Forbidden() {

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mb-16 items-center justify-center text-center">
            <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
                403
            </span>
      <h2 className="my-2 font-heading text-2xl font-bold">
        Something&apos;s missing
      </h2>
      <p>
        Anda Tidak Memiliki Akses Ke Halaman Ini
      </p>
    </div>
  );
}
