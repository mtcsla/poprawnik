import { AccountBox, Edit, Shield, Verified } from "@mui/icons-material";
import { Avatar, Dialog } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import React from "react";

export default function AdminUsers() {
  const usersPromise = React.useMemo(
    //async () => (await (await axios.get('/api/admin/get-all-users')).data as UserRecord[]),
    async () => [] as UserRecord[],
    []
  )



  const [users, setUsers] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true);


  React.useEffect(() => {
    usersPromise.then(users => {
      setUsers(users);
      console.log(users)
    })
  });




  const columns: GridColDef[] = [
    {
      field: 'picture', renderCell: (params) => {
        return <Avatar src={params.value} variant='rounded' />
      },
      filterable: false,
      sortable: false,
      headerName: 'zdjęcie',
      width: 90
    },
    {
      field: 'name',
      headerName: 'imię i nazwisko',
      width: 200,
      editable: true,
    },
    {
      field: 'email',
      headerName: 'adres e-mail',
      width: 250,
      editable: true,
    },
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'claims',
      editable: true,
      headerName: 'uprawnienia',
      renderEditCell: (params) => {
        return <div className="h-full w-full relative">
          <Dialog open >

          </Dialog>
        </div>
      },
      renderCell: (params) => {
        const claims = params.value as string[];

        const getIcon = (claim: string) => {
          if (claim === 'admin')
            return <div className="text-sm p-2 bg-red-200 rounded ">
              <Shield color='error' />
            </div>
          else if (claim === 'editor')
            return <div className="text-sm p-2 bg-green-200 rounded ">
              <Edit color='success' />
            </div>
          else if (claim === 'verifier')
            return <div className="text-sm p-2 bg-blue-200 rounded ">
              <Verified color='primary' />
            </div>
          else
            return <div className="text-sm p-2 bg-slate-200 rounded ">
              <AccountBox />
            </div>

        }

        return <button className="inline-flex gap-3">
          {claims.map(claim => getIcon(claim))}
        </button>
      },
      width: 250,
    },
  ];

  const rows: GridRowsProp = users.map(
    user => ({
      id: user.uid,
      picture: user.photoURL,
      name: user.displayName,
      email: user.email,
      claims: Object.keys(user.customClaims ?? {}).filter(key => (user.customClaims ?? {})[key] === true)
    })
  );




  return <>
    <h1 className="mb-0">Użytkownicy</h1>
    <p className="mb-6">Zarządzaj użytkownikami</p>

    <div className="mb-6 h-fit">
      <DataGrid experimentalFeatures={{ newEditingApi: true }} editMode="cell" filterMode="client" components={
        {
          Toolbar
        }
      } className=" min-h-[40rem] h-fit" {...{ rows, columns }} />
    </div>
  </>
};

const Toolbar = () => {
  return (
    <GridToolbar showQuickFilter />
  )
}


//copilot, draw svg of a shield


