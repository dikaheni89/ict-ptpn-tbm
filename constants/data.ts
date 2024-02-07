
export type Caturwulan = {
  id: number;
  name: string;
};

export type Bulan = {
  id: number;
  namabulan: string;
}

export type Minggu = {
  id: number;
  namaminggu: string;
}

export type Jenis = {
  id: number;
  namajenis: string;
}

export const caturwulans: Caturwulan[] = [
  {
    id: 1,
    name: "TW - I"
  },
  {
    id: 2,
    name: "TW - II"
  },
  {
    id: 3,
    name: "TW - III"
  },
  {
    id: 4,
    name: "TW - IV"
  }
];

export const bulans: Bulan[] = [
  {
    id: 1,
    namabulan: "Januari"
  },
  {
    id: 2,
    namabulan: "Februari"
  },
  {
    id: 3,
    namabulan: "Maret"
  },
  {
    id: 4,
    namabulan: "April"
  },
  {
    id: 5,
    namabulan: "Mei",
  },
  {
    id: 6,
    namabulan: "Juni"
  },
  {
    id: 7,
    namabulan: "Juli"
  },
  {
    id: 8,
    namabulan: "Agustus"
  },
  {
    id: 9,
    namabulan: "September"
  },
  {
    id: 10,
    namabulan: "Oktober"
  },
  {
    id: 11,
    namabulan: "November"
  },
  {
    id: 12,
    namabulan: "Desember"
  }
];

export const minggus: Minggu[] = [
  {
    id: 1,
    namaminggu: "W1"
  },
  {
    id: 2,
    namaminggu: "W2"
  },
  {
    id: 3,
    namaminggu: "W3"
  },
  {
    id: 4,
    namaminggu: "W4"
  }
];

export const jenis: Jenis[] = [
  {
    id: 1,
    namajenis: "Fisik"
  },
  {
    id: 2,
    namajenis: "Biaya"
  }
];


