import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';

import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";

// apis
import { credentials_list } from '../../api/credentials';

// define columns for this list page
const columns = [
  {
    key: 'username',
    label: 'Username'
  },
  {
    key: 'type',
    label: 'Credential Type'
  },
]

export default function CredentialsListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [search, setSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Credentials[LIST] | ServerOps";
  }, []);

  // call users list api using useQuery
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['credentials', user.id, page, page_size],

    queryFn: () => credentials_list({
      page,
      page_size
    }),

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // separate pagination and data
  const inventories = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="mb-4">

        <h1 className="txt-blue h3 fw-bold mb-1">Credentials</h1>

        <p className="text-secondary txt-silver mb-0">Available Credentials</p>
      </div>


      <DataTable
        columns={columns}
        rows={inventories}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Credentials.' : ''
        }
        emptyMessage="No Credentials found!"
        pagination={pagination}
        onPageChange={setPage}
        onRefresh={()=> refetch()}
      />




    </>
  );

}