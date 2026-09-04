import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { PERMISSIONS } from '../../config/permissions';
import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";
import { formatToIST } from '../../components/helpers';

// apis
import { inventories_list, inventory_set_status } from '../../api/inventories';

// define columns for this list page
const createColumns = ({
  hasPermission,
  onStatusChange,
  statusPending
}) => [
    {
      key: 'name',
      label: 'Name'
    },
    {
      key: 'hostname',
      label: 'Host',
      render: inventory => `${inventory.hostname}:${inventory.ssh_port}`
    },
    {
      key: 'environment',
      label: 'Environment'
    },
    {
      key: 'operating_system',
      label: 'Operating System'
    },
    {
      key: 'last_connected_at',
      label: 'Last Connected At',
      render: inventory => formatToIST(inventory.last_connected_at)
    },
    {
      key: 'status',
      label: 'Status',
      render: inventory => (
        <div className="d-flex align-items-center gap-2">

          <span className={`badge ${inventory.status ? 'bg-blue' : 'bg-silver'}`}>{inventory.status ? 'Active' : 'Inactive'}</span>

          {hasPermission('inventories.status') && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary btn-silver-outline"
              disabled={statusPending}
              aria-label={`${inventory.status ? 'Disable' : 'Enable'
                } inventory ${inventory.name}`}
              onClick={() => {
                onStatusChange({
                  id: inventory.id,
                  enabled: !inventory.status
                })
              }}
            > {inventory.status ? 'Disable' : 'Enable'}</button>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      label: '',
      render:
        inventory => {

          const link_prefix = `/inventories/${inventory.id}`;

          return (
            <>
              {hasPermission(PERMISSIONS.COMMAND_EXECUTIONS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/command-executions/'}><i className="bi bi-eye"></i>&emsp;Command Executions</Link>)}
              {hasPermission(PERMISSIONS.SERVICES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/services'}><i className="bi bi-gear"></i>&emsp;Services</Link>)}
              {hasPermission(PERMISSIONS.PROCESSES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/processes'}><i className="bi bi-cpu"></i>&emsp;Processes</Link>)}
              {hasPermission(PERMISSIONS.MANAGED_SERVICES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-silver" to={link_prefix + '/managed-services'}><i className="bi bi-gear-wide-connected"></i>&emsp;Managed Services</Link>)}
              {hasPermission(PERMISSIONS.MANAGED_COMMANDS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-silver" to={link_prefix + '/managed-commands'}><i className="bi bi-terminal-split"></i>&emsp;Managed Commands</Link>)}
              {hasPermission(PERMISSIONS.CREDENTIALS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/credentials'}><i className="bi bi-key"></i>&emsp;Credentials</Link>)}
              {hasPermission(PERMISSIONS.INVENTORIES_READ) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix}><i className="bi bi-eye"></i>&emsp;View</Link>)}
              {hasPermission(PERMISSIONS.INVENTORIES_UPDATE) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/edit'}><i className="bi bi-pencil"></i>&emsp;Edit</Link>)}
              {hasPermission(PERMISSIONS.INVENTORIES_DELETE) && (<button className="m-1 btn btn-sm btn-secondary btn-red"><i className="bi bi-trash"></i>&emsp;Remove</button>)}
              
            </>
          )
        }
    },
  ]

export default function InventoriesListPage() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [search, setSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Inventories[LIST] | ServerOps";
  }, []);

  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }) => inventory_set_status(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ['inventories', user.id]
    }),
  });

  const columns = createColumns({
    hasPermission,
    onStatusChange: values => statusMutation.mutate(values),
    statusPending: statusMutation.isPending,
  });

  // call inventories list api using useQuery
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['inventories', user.id, page, page_size],

    queryFn: () => inventories_list({
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

        <h1 className="txt-blue h3 fw-bold mb-1">Inventories</h1>

        <p className="text-secondary txt-silver mb-0">Available inventories</p>
      </div>


      {statusMutation.isError && (
        <div className="alert alert-danger" role="alert">
          {statusMutation.error?.response?.data?.message ||
            'Unable to update inventory status. Please try again.'}
        </div>
      )}


      <DataTable
        columns={columns}
        rows={inventories}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Inventories.' : ''
        }
        emptyMessage="No inventories found!"
        pagination={pagination}
        onPageChange={setPage}
        onRefresh={() => refetch()}
        onCreate={{
          permission: hasPermission(PERMISSIONS.INVENTORIES_CREATE),
          navigateTo: '/inventories/create'
        }}
      />




    </>
  );

}