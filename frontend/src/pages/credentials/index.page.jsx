import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";

import { getApiError } from "../../api/api-error";
import { PERMISSIONS } from '../../config/permissions';
import { useAuth } from "../../hooks/useAuth";
import useConfirmation from '../../hooks/useConfirmation';
import DataTable from "../../components/data-table";

// apis
import { credential_list, credential_set_status, credential_create, credential_update, credential_delete } from '../../api/credentials';
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
  onDelete,
  deletePending,
}) => [
    {
      key: 'username',
      label: 'Username'
    },
    {
      key: 'type',
      label: 'Type',
      render: credential => (<div className="text-uppercase">{credential.type.replace('-', ' ')}</div>)
    },
    {
      key: 'passphrase',
      label: 'Passphrase',
      render: credential => (<span className={`${credential.passphrase ? 'badge bg-blue' : ''}`}>{credential.passphrase ? 'Present' : '—'}</span>)
    },
    {
      key: 'credential',
      label: 'Inventory Hostname',
      render: credential => credential.inventory.hostname
    },
    {
      key: 'status',
      label: 'Status',
      render: credential => (
        <div className="d-flex align-items-center gap-2">

          {hasPermission('credentials.status') ? (

            <div className="form-check form-switch mb-0">
              <input type="checkbox" className="form-check-input" role="switch"
                checked={Boolean(credential.status)}
                disabled={statusPending}
                aria-label={`${credential.status ? 'Disable' : 'Enable'}`}
                onChange={() => {
                  onStatusChange({
                    id: credential.id,
                    enabled: !credential.status
                  });
                }}
              />
            </div>
          ) : (
            <span className={`badge ${credential.status ? 'bg-blue' : 'bg-red'}`}>{credential.status ? 'Active' : 'Inactive'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render:
        credential => {

          return (
            <>
              {hasPermission(PERMISSIONS.CREDENTIALS_READ) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onView(credential)}><i className="bi bi-eye"></i>&emsp;View</button>)}
              {hasPermission(PERMISSIONS.CREDENTIALS_UPDATE) && (<button className="m-1 btn btn-sm btn-secondary btn-blue" onClick={() => onEdit(credential)}><i className="bi bi-pencil"></i>&emsp;Edit</button>)}
              {hasPermission(PERMISSIONS.CREDENTIALS_DELETE) && (<button className="m-1 btn btn-sm btn-secondary btn-red" onClick={() => onDelete(credential)}><i className="bi bi-trash"></i>&emsp;{ deletePending ? 'Removing...' : 'Remove' }</button>)}
            </>
          )
        }
    },
  ]

export default function CredentialsPage() {
  const { user, hasPermission } = useAuth();
  const { confirm } = useConfirmation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState({
    create: false,
    view: false,
    edit: false,
    confirm: false,
    children: false,
  })
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Credentials | ServerOps";
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
    mutationFn: ({ id, enabled }) => credential_set_status(id, enabled),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['credentials', user.id]
      });

      toast.success(
        variables.enabled
          ? `Credential enabled successfully.`
          : "Credential disabled successfully."
      );
    },
    onError: e => toast.error(getApiError(e).message)
  });
  const createMutation = useMutation({
    mutationFn: values => credential_create(values),

    onSuccess: async () => {
      setModalOpen(previous => ({
        ...previous,
        create: false,
      }));

      setPage(1);

      await queryClient.invalidateQueries({
        queryKey: ["credentials", user.id],
      });

      toast.success("Credential created successfully.");
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }) =>
      credential_update(id, values),

    onSuccess: async () => {
      setModalOpen(previous => ({
        ...previous,
        edit: false,
      }));

      setPage(1);
      setSelectedCredential(null);

      await queryClient.invalidateQueries({
        queryKey: ["credentials", user.id],
      });

      toast.success("Credential updated successfully.");
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: id => credential_delete(id),
    onSuccess: async () => {
      setSelectedCredential(null);
      await queryClient.invalidateQueries({
        queryKey: ["credentials", user.id],
      });

      toast.success("Credential deleted successfully.");
    },
    onError: error => {
      toast.error(getApiError(error).message);
    },
  });
  // |====================================================================Mutations

  const handleStatusChange = async values => {
    statusMutation.mutate({
      ...values,
    });
  };

  const handleView = (credential) => {
    setSelectedCredential(credential);

    setModalOpen((prev) => ({
      ...prev,
      view: true,
    }))
  };

  const handleEdit = (credential) => {
    setSelectedCredential(credential);

    setModalOpen((prev) => ({
      ...prev,
      edit: true,
    }))
  };

  const handleDelete = async credential => {
    const { confirmed } = await confirm({
      title: "Delete credential?",
      message: (
        <>
          You are about to delete {" "}
          <strong>{credential.username}</strong>.
          <br />
          This action cannot be undone.
        </>
      ),
      confirmLabel: 'Delete',
      variant: 'danger',
    });

    if(!confirmed) return;

    deleteMutation.mutate(credential.id);
  };

  const handlePageSizeChange = newPageSize => {
    setPageSize(newPageSize);
    setPage(1);
  }

  const columns = createColumns({
    hasPermission,
    onStatusChange: handleStatusChange,
    statusPending: statusMutation.isPending,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    deletePending: deleteMutation.isPending,
  });

  // call credentials list api using useQuery
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['credentials', user.id, page, pageSize, debouncedSearch],

    queryFn: () => credential_list({
      page,
      page_size: pageSize,
      search: debouncedSearch,
    }),

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // separate pagination and data
  const credentials = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="mb-4">

        <h1 className="txt-blue h3 fw-bold mb-1">Credentials</h1>

        <p className="text-secondary txt-silver mb-0">Available credentials</p>
      </div>


      <DataTable
        columns={columns}
        rows={credentials}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Credentials.' : ''
        }
        emptyMessage="No credentials found!"
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 15, 25, 50, 75, 100]}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        {...(hasPermission(PERMISSIONS.CREDENTIALS_CREATE) && {
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

      {/* <CreateModal
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
      /> */}

      {/* <EditModal
        open={modalOpen.edit}
        credentialId={selectedCredential?.id}
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

          setSelectedCredential(null);
        }}
        onSubmit={values => updateMutation.mutate({
          id: selectedCredential.id,
          values,
        })
        }
      /> */}

      <ViewModal
        open={modalOpen.view}
        credentialId={selectedCredential?.id}
        onClose={() => {
          setModalOpen(prev => ({
            ...prev,
            view: false
          }));
          setSelectedCredential(null);
        }}
      />

    </>
  );

}