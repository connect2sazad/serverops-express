import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';

import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";

// apis
import { command_executions_list } from '../../api/command-executions';

// define columns for this list page
const columns = [
  {
    key: 'command',
    label: 'Command'
  },
  {
    key: 'command_status',
    label: 'Command Status'
  },
]

export default function CommandExecutionsListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [search, setSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Command Executions[LIST] | ServerOps";
  }, []);

  // call command-executions list api using useQuery
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['command-executions', user.id, page, page_size],

    queryFn: () => command_executions_list({
      page,
      page_size
    }),

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // separate pagination and data
  const command_executions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="mb-4">

        <h1 className="txt-blue h3 fw-bold mb-1">Command Executions</h1>

        <p className="text-secondary txt-silver mb-0">Available Command Executions</p>
      </div>


      <DataTable
        columns={columns}
        rows={command_executions}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Command Executions.' : ''
        }
        emptyMessage="No Command executions found!"
        pagination={pagination}
        onPageChange={setPage}
        onRefresh={()=> refetch()}
      />




    </>
  );

}