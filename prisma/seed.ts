import { prisma } from "../lib/prisma";
import { hash } from "../lib/crypto";


async function userGroups() {
  const data = [
    {
      name: "Superadmin"
    },
    {
      name: "Admin"
    },
    {
      name: "Operator"
    },
  ];

  return Promise.all(
    data.map((item) => {
      return prisma.userGroup.upsert({
        where: {
          name: item.name
        },
        create: {
          name: item.name
        },
        update: {
          name: item.name
        }
      });
    })
  );
}

async function adminModules() {
  let data = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'dashboard',
      label: 'Dashboard'
    },
    {
      name: 'Management User',
      url: '/dashboard/user',
      icon: 'user',
      label: 'User'
    },
    {
      name: 'Kode Rekening',
      url: '/dashboard/rekening',
      icon: 'kanban',
      label: 'Rekening'
    },
    {
      name: 'Uraian Pekerjaan',
      url: '/dashboard/uraian',
      icon: 'list',
      label: 'Uraian'
    },
    {
      name: 'Standar Fisik',
      url: '/dashboard/standar',
      icon: 'computer',
      label: 'Standar'
    },
    {
      name: 'Laporan RKAP',
      url: '/dashboard/laporan',
      icon: 'database',
      label: 'laporan'
    },
  ];

  return Promise.all(data.map((item, index) => {
    return prisma.adminModule.upsert({
      where: {
        url: item.url
      },
      create: {
        name: item.name,
        url: item.url,
        icon: item.icon,
        label: item.label,
        sort: index + 1
      },
      update: {
        name: item.name,
        url: item.url,
        icon: item.icon,
        label: item.label,
        sort: index + 1
      }
    });
  }))
}

async function userGroupAdminModules() {
  let data = [
    {
      group_name: "Superadmin",
      modules: [
        {
          name: 'Dashboard',
          create: true,
          read: true,
          update: true,
          delete: true
        },
        {
          name: 'Management User',
          create: true,
          read: true,
          update: true,
          delete: true
        },
        {
          name: 'Standar Fisik',
          create: true,
          read: true,
          update: true,
          delete: true
        },
        {
          name: 'Laporan RKAP',
          create: true,
          read: true,
          update: true,
          delete: true
        },
      ]
    },
    {
      group_name: "Admin",
      modules: [
        {
          name: 'Dashboard',
          create: true,
          read: true,
          update: true,
          delete: true
        },
        {
          name: 'Standar Fisik',
          create: true,
          read: true,
          update: true,
          delete: true
        },
      ]
    },
    {
      group_name: "Operator",
      modules: [
        {
          name: 'Dashboard',
          create: true,
          read: true,
          update: true,
          delete: true
        },
        {
          name: 'Standar Fisik',
          create: true,
          read: true,
          update: true,
          delete: false
        },
      ]
    },
  ];


  let queue = [];
  for (let group of data) {
    for (let _module of group.modules) {
      queue.push(
        prisma.userGroupAdminModule.create({
          data: {
            module: {
              connect: {
                name: _module.name
              }
            },
            group: {
              connect: {
                name: group.group_name
              }
            },
            create: _module.create,
            read: _module.read,
            update: _module.update,
            delete: _module.delete
          }
        })
      )
    }
  }

  await prisma.userGroupAdminModule.deleteMany();
  return Promise.all(queue);
}

async function users() {
  let data = [
    {
      name: "Superadmin",
      username: "superadmin",
      email: "admin@icptpn.com",
      password: hash("ictptpn@!123"),
      group: "Superadmin",
    },
    {
      name: "Admin",
      nip: "12345672290",
      username: "admin",
      email: "admin@ictptpn.com",
      password: hash("ictptpn@!123"),
      group: "Admin",
    },
  ];

  return Promise.all(
    data.map((item) => {
      return prisma.user.upsert({
        where: {
          email: item.email
        },
        create: {
          name: item.name,
          username: item.username,
          email: item.email,
          password: item.password,
          status: "ACTIVE",
          group: {
            connect: {
              name: item.group
            }
          },
        },
        update: {
          name: item.name,
          username: item.username,
          email: item.email,
          password: item.password,
          status: "ACTIVE",
          group: {
            connect: {
              name: item.group
            }
          }
        }
      });
    })
  );
}

async function kodeReg() {
  const data = [
    {
      kode: "250",
      name: "Pembibitan Pre Nursery (0-3 Bulan)"
    },
    {
      kode: "251",
      name: "Pembibitan Main Nursery (4-12 Bulan)"
    },
    {
      kode: "040.003",
      name: "Tanaman Ulang TEH"
    },
    {
      kode: "041.003",
      name: "Pemeliharaan TBM I (Teh)"
    },
    {
      kode: "601.003",
      name: "Pemeliharaan TM (Teh)"
    },
    {
      kode: "601.002",
      name: "Pemeliharaan TM (Kelapa Sawit)"
    },
    {
      kode: "601.60",
      name: "Pengangkutan"
    },
    {
      kode: "602.002",
      name: "Panen & Pengangkutan"
    },
    {
      kode: "040.001",
      name: "Tanaman Ulang di Areal Rata/Gelombang/Jurang (Mekanis)"
    },
    {
      kode: "040.001",
      name: "Tanaman Ulang di Areal Gambut"
    }
  ];

  return Promise.all(
    data.map((item) => {
      return prisma.kodeReg.upsert({
        where: {
          kode: item.kode
        },
        create: {
          kode: item.kode,
          name: item.name
        },
        update: {
          kode: item.kode,
          name: item.name
        }
      })
    })
  )
}

async function Pekerjaan() {
  let data = [
    {
      kodereg: '250',
      rek: '00',
      uraian: 'Gaji dan Biaya Sosial (Mdr)',
      fisik: 'us',
      norma: '1 us/pembibitan',
      rotasi: '',
      keterangan: ''
    },
    {
      kodereg: '251',
      rek: '00',
      uraian: 'Gaji dan Biaya Sosial (Mdr)',
      fisik: 'us',
      norma: '1 us/pembibitan',
      rotasi: '',
      keterangan: 'atau OS'
    }
  ];

  return Promise.all(
    data.map((item) => {
      return prisma.pekerjaan.create({
          data: {
            kodereg: {
              connect: {
                kode: item.kodereg
              }
            },
            rek: item.rek,
            uraian: item.uraian,
            fisik: item.fisik,
            norma: item.norma,
            rotasi: item.rotasi,
            keterangan: item.keterangan
          }
      });
    })
  )
}

async function run() {
  await userGroups();
  await users();
  await adminModules();
  await userGroupAdminModules();
  await kodeReg();
  await Pekerjaan();
}

run();