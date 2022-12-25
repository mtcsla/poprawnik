import { ArrowRight } from '@mui/icons-material';
import { Button, Table, TableCell, TableHead, TableRow } from '@mui/material';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Link from 'next/link';

export default function AdminDashboard() {



	const rows: GridRowsProp = [
		{ id: 1, col1: 'Hello', col2: 'World' },
		{ id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
		{ id: 3, col1: 'MUI', col2: 'is Amazing' },
	];
	const columns: GridColDef[] = [
		{ field: 'col1', headerName: 'Column 1', width: 150 },
		{ field: 'col2', headerName: 'Column 2', width: 150 },
	];
	return <>
		<h1 className='mb-0'>Panel administratora</h1>
		<p>Zarządzaj serwisem</p>
		<div className='inline-flex flex-col gap-2 w-full my-6'>
			<Table className='border mb-2'>
				<TableHead>
					<TableRow>
						<TableCell>
							<h5>Moduły administratora</h5>
							<p>Wybierz moduł, aby nim zarządzać.</p>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableRow>
					<TableCell className='p-2'>
						<Link href='/account/admin/users'>
							<Button className='flex rounded items-center justify-between w-full  p-4'>
								Użytkownicy <ArrowRight />
							</Button>
						</Link>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className='p-2'>
						<Link href='/account/admin/products'>
							<Button className='flex rounded items-center justify-between w-full  p-4'>
								Pisma <ArrowRight />
							</Button>
						</Link>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className='p-2'>
						<Button disabled className='flex rounded items-center justify-between w-full  p-4'>
							Kalkulatory <ArrowRight />
						</Button>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className='p-2'>
						<Link href='/account/admin/articles'>
							<Button className='flex rounded items-center justify-between w-full  p-4'>
								Artykuły <ArrowRight />
							</Button>
						</Link>
					</TableCell>
				</TableRow>
			</Table>
		</div>
	</>
};