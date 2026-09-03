import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';

import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";

// apis
import { users_list } from '../../api/users';

// define columns for this list page
const columns = [
  {
    key: 'name',
    label: 'Name'
  },
]

export default function UsersListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [search, setSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Users[LIST] | ServerOps";
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
    queryKey: ['users', user.id, page, page_size],

    queryFn: () => users_list({
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

        <h1 className="txt-blue h3 fw-bold mb-1">Users</h1>

        <p className="text-secondary txt-silver mb-0">Available Users</p>
      </div>


      <DataTable
        columns={columns}
        rows={inventories}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Users.' : ''
        }
        emptyMessage="No Users found!"
        pagination={pagination}
        onPageChange={setPage}
        onRefresh={()=> refetch()}
      />




    </>
  );

}