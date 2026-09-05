import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { PERMISSIONS } from '../../config/permissions';
import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";
import { formatToIST } from '../../components/helpers';

// apis
import { inventory_list, inventory_set_status, inventory_create, inventory_update } from '../../api/inventories';
import CreateModal from "./create.modal";
import ViewModal from "./view.modal";
import EditModal from "./edit.modal";

// define columns for this list page
const createColumns = ({
  hasPermission,
  onStatusChange,
  statusPending,
  onView,
  onEdit,
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
      label: 'OS'
    },
    {
      key: 'last_connected_at',
      label: 'Last Connected',
      render: inventory => formatToIST(inventory.last_connected_at)
    },
    {
      key: 'status',
      label: 'Status',
      render: inventory => (
        <div className="d-flex align-items-center gap-2">

          <span className={`badge ${inventory.status ? 'bg-blue' : 'bg-red'}`}>{inventory.status ? 'Active' : 'Inactive'}</span>

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
      label: 'Operations & Actions',
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
              {hasPermission(PERMISSIONS.INVENTORIES_READ) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onView(inventory)}><i className="bi bi-eye"></i>&emsp;View</button>)}
              {hasPermission(PERMISSIONS.INVENTORIES_UPDATE) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onEdit(inventory)}><i className="bi bi-pencil"></i>&emsp;Edit</button>)}
              {hasPermission(PERMISSIONS.INVENTORIES_DELETE) && (<button className="m-1 btn btn-sm btn-secondary btn-red"><i className="bi bi-trash"></i>&emsp;Remove</button>)}

            </>
          )
        }
    },
  ]

export default function InventoriesPage() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [modalOpen, setModalOpen] = useState({
    create: false,
    view: false,
    edit: false,
    confirm: false,
    children: false,
  })
  const [selectedInventory, setSelectedInventory] = useState(null);
  // const [search, setSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Inventories[LIST] | ServerOps";
  }, []);

  // Mutations====================================================================
  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }) => inventory_set_status(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ['inventories', user.id]
    }),
  });
  const createMutation = useMutation({
    mutationFn: values => inventory_create(values),
    onSuccess: async () => {
      setModalOpen(prev => ({
        ...prev,
        create: false,
      }));

      setPage(1);

      await queryClient.invalidateQueries({
        queryKey: ['inventories', user.id]
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({id, values}) => inventory_update(id, values),
    onSuccess: async () => {
      setModalOpen(prev => ({
        ...prev,
        edit: false,
      }));

      setPage(1);
      setSelectedInventory(null);

      await queryClient.invalidateQueries({
        queryKey: ['inventories', user.id]
      });
    },
  });

  const handleView = (inventory) => {
    setSelectedInventory(inventory);

    setModalOpen((prev) => ({
      ...prev,
      view: true,
    }))
  };

  const handleEdit = (inventory) => {
    setSelectedInventory(inventory);

    setModalOpen((prev) => ({
      ...prev,
      edit: true,
    }))
  };

  const columns = createColumns({
    hasPermission,
    onStatusChange: values => statusMutation.mutate(values),
    statusPending: statusMutation.isPending,
    onView: handleView,
    onEdit: handleEdit
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

    queryFn: () => inventory_list({
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
        {...(hasPermission(PERMISSIONS.INVENTORIES_CREATE) && {
          onCreate: () => {
            setModalOpen((prev) => ({
              ...prev,
              create: true
            }));
          }
        })}

      />

      <CreateModal
        open={modalOpen.create}
        submitting={createMutation.isPending}
        error={
          createMutation.isError ? createMutation.error : null
        }
        onClose={() => {
          if (createMutation.isPending) return;

          createMutation.reset();

          setModalOpen(prev => ({
            ...prev,
            create: false,
          }));
        }}
        onSubmit={values => createMutation.mutate(values)
        }
      />

      <EditModal
        open={modalOpen.edit}
        inventoryId={selectedInventory?.id}
        submitting={updateMutation.isPending}
        error={
          updateMutation.isError ? updateMutation.error : null
        }
        onClose={() => {
          if (updateMutation.isPending) return;

          updateMutation.reset();

          setModalOpen(prev => ({
            ...prev,
            edit: false,
          }));

          setSelectedInventory(null);
        }}
        onSubmit={values => updateMutation.mutate({
          id: selectedInventory.id,
          values,
        })
        }
      />

      <ViewModal
        open={modalOpen.view}
        inventoryId={selectedInventory?.id}
        onClose={() => {
          setModalOpen(prev => ({
            ...prev,
            view: false
          }));
          setSelectedInventory(null);
        }}
      />

    </>
  );

}