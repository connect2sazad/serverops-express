import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";

import { getApiError } from "../../api/api-error";
import { PERMISSIONS } from '../../config/permissions';
import { useAuth } from "../../hooks/useAuth";
import useConfirmation from '../../hooks/useConfirmation';
import DataTable from "../../components/data-table";
import { formatToIST } from '../../components/helpers';

// apis
import { inventory_list, inventory_set_status, inventory_create, inventory_update, inventory_delete, inventory_host_key_inspect, inventory_host_key_trust, inventory_test_connection, inventory_discovery } from '../../api/inventories';
import CreateModal from "./create.modal";
import ViewModal from "./view.modal";
import EditModal from "./edit.modal";
import HostKeyModal from "./host-key.modal";

// define columns for this list page
const createColumns = ({
  hasPermission,
  onStatusChange,
  statusPending,
  onView,
  onEdit,
  onDelete,
  onHostKey,
  deletePending,
  onTestConnection,
  testingInventoryId,
  onDiscovery,
  discoveringInventoryId
}) => [
    {
      key: "serial_number",
      label: "Sl. No.",
      hideable: false,
    },
    {
      key: 'name',
      label: 'Name',
      hideable: false,
    },
    {
      key: 'hostname',
      label: 'Host',
      hideable: false,
      render: inventory => `${inventory.hostname}:${inventory.ssh_port}`
    },
    {
      key: 'environment',
      label: 'Environment',
      defaultVisible: false,
    },
    {
      key: 'operating_system',
      label: 'OS',
      defaultVisible: false
    },
    {
      key: 'last_connected_at',
      label: 'Last Connected',
      defaultVisible: false,
      render: inventory => formatToIST(inventory.last_connected_at)
    },
    {
      key: 'description',
      label: 'Description',
      defaultVisible: false,
    },
    {
      key: 'connection_status',
      label: 'Connection Status',
      defaultVisible: false,
    },
    {
      key: 'discovered_hostname',
      label: 'Discovered Hostname',
      defaultVisible: false,
    },
    {
      key: 'os_name',
      label: 'OS Name',
      defaultVisible: false,
    },
    {
      key: 'os_version',
      label: 'OS Version',
      defaultVisible: false,
    },
    {
      key: 'os_version_id',
      label: 'OS Version ID',
      defaultVisible: false,
    },
    {
      key: 'kernel',
      label: 'Kernel',
      defaultVisible: false,
    },
    {
      key: 'architecture',
      label: 'Architecture',
      defaultVisible: false,
    },
    {
      key: 'cpu_cores',
      label: 'CPU Cores',
      defaultVisible: false,
    },
    {
      key: 'memory_total_kib',
      label: 'Memory',
      defaultVisible: false,
      render: inventory => {
        let ram = inventory?.memory_total_kib;
        if (ram) {
          ram = ram / 1024 / 1024;
          ram = ram.toFixed(2)
          return ram + ' GiB';
        }
      }
    },
    {
      key: 'uptime_seconds',
      label: 'Uptime',
      defaultVisible: false,
      render: inventory => inventory.uptime_seconds != null ? inventory.uptime_seconds + 's' : '—'
    },
    {
      key: 'remarks',
      label: 'Remarks',
      defaultVisible: false,
    },
    {
      key: 'tags',
      label: 'Tags',
      defaultVisible: false,
      render: inventory => {
        const tags = inventory.tags;
        if (tags !== null && tags.length) {
          return tags.map(tag => (
            <span className="badge rounded-pill bg-blue m-1" key={tag}>
              {tag}
            </span>
          ))
        } else return '—'

      }
    },
    {
      key: 'inventory_collected_at',
      label: 'Inventory Collected',
      defaultVisible: false,
      render: inventory => formatToIST(inventory.inventory_collected_at)
    },
    {
      key: 'created_at',
      label: 'Created At',
      defaultVisible: false,
      render: inventory => formatToIST(inventory.created_at)
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      defaultVisible: false,
      render: inventory => formatToIST(inventory.updated_at)
    },
    {
      key: 'creator',
      label: 'Creator',
      defaultVisible: false,
      render: inventory => '@' + inventory.creator.userid
    },
    {
      key: 'status',
      label: 'Status',
      defaultVisible: false,
      render: inventory => (
        <div className="d-flex align-items-center gap-2">

          {hasPermission('inventories.status') ? (

            <div className="form-check form-switch mb-0">
              <input type="checkbox" className="form-check-input" role="switch"
                checked={Boolean(inventory.status)}
                disabled={statusPending}
                aria-label={`${inventory.status ? 'Disable' : 'Enable'}`}
                onChange={() => {
                  onStatusChange({
                    id: inventory.id,
                    enabled: !inventory.status
                  });
                }}
              />
            </div>
          ) : (
            <span className={`badge ${inventory.status ? 'bg-blue' : 'bg-red'}`}>{inventory.status ? 'Active' : 'Inactive'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'ssh',
      label: 'SSH',
      render:
        inventory => {

          const link_prefix = `/inventories/${inventory.id}`;

          return (
            <>
              {hasPermission(PERMISSIONS.INVENTORIES_HOST_KEY_READ) && (
                <button
                  type="button"
                  className="m-1 btn btn-sm btn-warning btn-yellow"
                  onClick={() => onHostKey(inventory)}
                >
                  <i className="bi bi-fingerprint"></i>
                  &emsp;Host Key
                </button>
              )}
              {hasPermission(PERMISSIONS.INVENTORIES_TEST_CONNECTION) && (
                <button
                  type="button"
                  className="m-1 btn btn-sm btn-outline-success btn-yellow"
                  disabled={testingInventoryId !== null}
                  onClick={() => onTestConnection(inventory)}
                >
                  {testingInventoryId === inventory.id ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Testing…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plug me-2" />
                      Test Connection
                    </>
                  )}
                </button>
              )}
              {hasPermission(PERMISSIONS.INVENTORIES_DISCOVER) && (
                <button
                  type="button"
                  className="m-1 btn btn-sm btn-outline-success btn-yellow"
                  disabled={discoveringInventoryId !== null}
                  onClick={() => onDiscovery(inventory)}
                >
                  {discoveringInventoryId === inventory.id ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Running discovery…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-radar me-2" />
                      Discovery
                    </>
                  )}
                </button>
              )}
            </>
          )
        }
    },
    {
      key: 'operations',
      label: 'Operations',
      render:
        inventory => {

          const link_prefix = `/inventories/${inventory.id}`;

          return (
            <>
              {/* {hasPermission(PERMISSIONS.COMMAND_EXECUTIONS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/command-executions/'}><i className="bi bi-eye"></i>&emsp;Command Executions</Link>)} */}
              {hasPermission(PERMISSIONS.SERVICES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/services'}><i className="bi bi-gear"></i>&emsp;Services</Link>)}
              {hasPermission(PERMISSIONS.PROCESSES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/processes'}><i className="bi bi-cpu"></i>&emsp;Processes</Link>)}
              {hasPermission(PERMISSIONS.MANAGED_SERVICES_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-silver" to={link_prefix + '/managed-services'}><i className="bi bi-gear-wide-connected"></i>&emsp;Managed Services</Link>)}
              {hasPermission(PERMISSIONS.MANAGED_COMMANDS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-silver" to={link_prefix + '/managed-commands'}><i className="bi bi-terminal-split"></i>&emsp;Managed Commands</Link>)}

            </>
          )
        }
    },
    {
      key: 'actions',
      label: 'Actions',
      defaultVisible: false,
      render:
        inventory => {

          const link_prefix = `/inventories/${inventory.id}`;

          return (
            <>


              {/* {hasPermission(PERMISSIONS.CREDENTIALS_LIST) && (<Link className="m-1 btn btn-sm btn-secondary btn-blue" to={link_prefix + '/credentials'}><i className="bi bi-key"></i>&emsp;Credentials</Link>)} */}
              {hasPermission(PERMISSIONS.INVENTORIES_READ) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onView(inventory)}><i className="bi bi-eye"></i>&emsp;View</button>)}
              {hasPermission(PERMISSIONS.INVENTORIES_UPDATE) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onEdit(inventory)}><i className="bi bi-pencil"></i>&emsp;Edit</button>)}
              {hasPermission(PERMISSIONS.INVENTORIES_DELETE) && (<button className="m-1 btn btn-sm btn-secondary btn-red" onClick={() => onDelete(inventory)}><i className="bi bi-trash"></i>&emsp;{deletePending ? 'Removing...' : 'Remove'}</button>)}

            </>
          )
        }
    }
  ]

export default function InventoriesPage() {
  const { user, hasPermission } = useAuth();
  const { confirm } = useConfirmation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hostKeyInventory, setHostKeyInventory] = useState(null);
  const [hostKeyData, setHostKeyData] = useState(null);
  const [hostKeyError, setHostKeyError] = useState(null);
  const [modalOpen, setModalOpen] = useState({
    create: false,
    view: false,
    edit: false,
    confirm: false,
    children: false,
  })
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [testingInventoryId, setTestingInventoryId] = useState(null);
  const [discoveringInventoryId, setDiscoveringInventoryId] = useState(null);

  // set page title
  useEffect(() => {
    document.title = "Inventories | ServerOps";
  }, []);

  // set search - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);


  // Mutations====================================================================|
  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }) => inventory_set_status(id, enabled),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['inventories', user.id]
      });

      toast.success(
        variables.enabled
          ? `Inventory enabled successfully.`
          : "Inventory disabled successfully."
      );
    },
    onError: e => toast.error(getApiError(e).message)
  });
  const createMutation = useMutation({
    mutationFn: values => inventory_create(values),

    onSuccess: async () => {
      setModalOpen(previous => ({
        ...previous,
        create: false,
      }));

      setPage(1);

      await queryClient.invalidateQueries({
        queryKey: ["inventories", user.id],
      });

      toast.success("Inventory created successfully.");
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }) =>
      inventory_update(id, values),

    onSuccess: async () => {
      setModalOpen(previous => ({
        ...previous,
        edit: false,
      }));

      setPage(1);
      setSelectedInventory(null);

      await queryClient.invalidateQueries({
        queryKey: ["inventories", user.id],
      });

      toast.success("Inventory updated successfully.");
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: id => inventory_delete(id),
    onSuccess: async () => {
      setSelectedInventory(null);
      await queryClient.invalidateQueries({
        queryKey: ["inventories", user.id],
      });

      toast.success("Inventory deleted successfully.");
    },
    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const inspectHostKeyMutation = useMutation({
    mutationFn: inventoryId =>
      inventory_host_key_inspect(inventoryId),

    onSuccess: response => {
      const result = response?.data?.data ?? response?.data ?? response;
      setHostKeyData(result);
      setHostKeyError(null);
    },

    onError: error => {
      setHostKeyData(null);
      setHostKeyError(getApiError(error).message);
    },
  });
  const trustHostKeyMutation = useMutation({
    mutationFn: ({ inventoryId, fingerprint }) =>
      inventory_host_key_trust(inventoryId, fingerprint),

    onSuccess: async response => {
      toast.success(
        response?.data?.message ??
        "SSH host key trusted successfully."
      );

      if (hostKeyInventory?.id) {
        await inspectHostKeyMutation.mutateAsync(
          hostKeyInventory.id
        );
      }
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const testConnectionMutation = useMutation({
    mutationFn: inventoryId =>
      inventory_test_connection(inventoryId),

    onSuccess: async response => {
      toast.success(
        response?.message ?? "SSH Connection Successful."
      );

      await queryClient.invalidateQueries({
        queryKey: ["inventories", user.id],
      });
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },

    onSettled: () => {
      setTestingInventoryId(null);
    },
  });
  const discoveryMutation = useMutation({
    mutationFn: inventoryId =>
      inventory_discovery(inventoryId),

    onSuccess: async response => {
      toast.success(
        response?.message ?? "SSH Discovery Successful."
      );

      await queryClient.invalidateQueries({
        queryKey: ["inventories", user.id],
      });
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },

    onSettled: () => {
      setDiscoveringInventoryId(null);
    },
  });
  // |====================================================================Mutations

  // Handles====================================================================|
  const handleStatusChange = async values => {
    statusMutation.mutate({
      ...values,
    });
  };

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

  const handleOpenHostKey = useCallback(inventory => {
    setHostKeyInventory(inventory);
    setHostKeyData(null);
    setHostKeyError(null);

    inspectHostKeyMutation.mutate(inventory.id);
  }, [inspectHostKeyMutation]);

  const handleCloseHostKey = useCallback(() => {
    if (trustHostKeyMutation.isPending) return;

    setHostKeyInventory(null);
    setHostKeyData(null);
    setHostKeyError(null);
  }, [trustHostKeyMutation.isPending]);

  const handleTrustHostKey = async fingerprint => {
    if (!hostKeyInventory) return;

    const result = await confirm({
      title: "Trust SSH host key?",
      message: (
        <>
          Trust the presented SSH host key for{" "}
          <strong>{hostKeyInventory.name}</strong>?
          <br />
          <br />
          Verify this fingerprint through a trusted source before
          continuing:
          <div className="border rounded bg-light p-2 mt-2 font-monospace text-break">
            {fingerprint}
          </div>
        </>
      ),
      confirmLabel: "Trust Host Key",
      variant: "warning",
    });

    if (!result.confirmed) return;

    trustHostKeyMutation.mutate({
      inventoryId: hostKeyInventory.id,
      fingerprint,
    });
  };

  const handleDelete = async inventory => {
    const { confirmed, inputValue: deleteConfirmation } = await confirm({
      title: "Delete inventory?",
      message: (
        <>
          You are about to delete {" "}
          <strong>{inventory.name}</strong>.
          <br />
          This action cannot be undone.
        </>
      ),
      confirmLabel: 'Delete',
      variant: 'danger',
      input: {
        label: (
          <>
            Type <strong>Delete</strong> for confirmation:
          </>
        ),
        validationLabel: "Delete Confirmation",
        placeholder: "Delete",
        required: true,
        type: 'text',
        minLength: 6,
        maxLength: 6,
        requiredMessage: "Please type Delete to continue.",
        validate: value => value === "Delete" || 'You must type "Delete" exactly.',
      },
    });

    if (!confirmed) return;

    deleteMutation.mutate(inventory.id);
  };

  const handlePageSizeChange = newPageSize => {
    setPageSize(newPageSize);
    setPage(1);
  }

  const handleTestConnection = async inventory => {
    if (testConnectionMutation.isPending) return;

    setTestingInventoryId(inventory.id);

    try {
      const hostKey = await inventory_host_key_inspect(
        inventory.id
      );

      if (hostKey.trust_status === "mismatch") {
        toast.error(
          "SSH host-key mismatch detected. Connection was blocked."
        );

        setHostKeyInventory(inventory);
        setHostKeyData(hostKey);
        setHostKeyError(null);
        setTestingInventoryId(null);

        return;
      }

      if (hostKey.trust_status !== "trusted") {
        toast.warning(
          "Trust this server's SSH host key before testing the connection."
        );

        setHostKeyInventory(inventory);
        setHostKeyData(hostKey);
        setHostKeyError(null);
        setTestingInventoryId(null);

        return;
      }

      testConnectionMutation.mutate(inventory.id);
    } catch (error) {
      toast.error(getApiError(error).message);
      setTestingInventoryId(null);
    }
  };
  const handleDiscovery = async inventory => {
    if (discoveryMutation.isPending) return;

    setDiscoveringInventoryId(inventory.id);

    try {
      const hostKey = await inventory_host_key_inspect(
        inventory.id
      );

      if (hostKey.trust_status === "mismatch") {
        toast.error(
          "SSH host-key mismatch detected. Connection was blocked."
        );

        setHostKeyInventory(inventory);
        setHostKeyData(hostKey);
        setHostKeyError(null);
        setDiscoveringInventoryId(null);

        return;
      }

      if (hostKey.trust_status !== "trusted") {
        toast.warning(
          "Trust this server's SSH host key before running discovery."
        );

        setHostKeyInventory(inventory);
        setHostKeyData(hostKey);
        setHostKeyError(null);
        setDiscoveringInventoryId(null);

        return;
      }

      discoveryMutation.mutate(inventory.id);
    } catch (error) {
      toast.error(getApiError(error).message);
      setDiscoveringInventoryId(null);
    }
  };

  // |====================================================================Handles

  const columns = createColumns({
    hasPermission,
    onStatusChange: handleStatusChange,
    statusPending: statusMutation.isPending,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onHostKey: handleOpenHostKey,
    deletePending: deleteMutation.isPending,
    onTestConnection: handleTestConnection,
    testingInventoryId,
    onDiscovery: handleDiscovery,
    discoveringInventoryId,
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
    queryKey: ['inventories', user.id, page, pageSize, debouncedSearch],

    queryFn: () => inventory_list({
      page,
      page_size: pageSize,
      search: debouncedSearch,
    }),

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // separate pagination and data
  const pagination = data?.pagination;

  const inventories = useMemo(() => {
    const records = data?.data ?? [];

    const currentPage =
      pagination?.page ?? page;

    const currentPageSize =
      pagination?.page_size ?? pageSize;

    const startIndex =
      (currentPage - 1) * currentPageSize;

    return records.map((inventory, index) => ({
      ...inventory,
      serial_number: startIndex + index + 1,
    }));
  }, [
    data?.data,
    pagination?.page,
    pagination?.page_size,
    page,
    pageSize,
  ]);

  return (
    <>
      <div className="mb-4">

        <h1 className="txt-blue h3 fw-bold mb-1">Inventories</h1>

        <p className="text-secondary txt-silver mb-0">Available inventories</p>
      </div>


      <DataTable
        tableId="inventories"
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
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 15, 25, 50, 75, 100]}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        {...(hasPermission(PERMISSIONS.INVENTORIES_CREATE) && {
          onCreate: () => {
            setModalOpen((prev) => ({
              ...prev,
              create: true
            }));
          }
        })}
        onSearch={setSearch}
        searchValue={search}
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

      <HostKeyModal
        open={Boolean(hostKeyInventory)}
        inventory={hostKeyInventory}
        hostKey={hostKeyData}
        loading={inspectHostKeyMutation.isPending}
        trusting={trustHostKeyMutation.isPending}
        error={hostKeyError}
        allowTrust={hasPermission(PERMISSIONS.INVENTORIES_HOST_KEY_TRUST)}
        onTrust={handleTrustHostKey}
        onClose={handleCloseHostKey}
      />

    </>
  );

}