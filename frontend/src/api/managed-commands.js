import { apiClient } from "./client";

const inventoryRoute = inventoryId =>
  `/inventories/${inventoryId}/managed-commands`;

function normalizePayload(data) {
  return {
    service_name: data.service_name?.trim(),

    can_start: Boolean(data.can_start),
    can_stop: Boolean(data.can_stop),
    can_restart: Boolean(data.can_restart),
    can_enable: Boolean(data.can_enable),
    can_disable: Boolean(data.can_disable),

    remarks: data.remarks?.trim() || null,
    tags: Array.isArray(data.tags)
      ? data.tags
      : [],
  };
}

export async function managed_service_list({
  inventoryId,
  page = 1,
  page_size = 10,
  search = "",
}) {
  const response = await apiClient.get(
    inventoryRoute(inventoryId),
    {
      params: {
        page,
        page_size,
        search: search || undefined,
      },
    }
  );

  return response.data;
}

export async function managed_service_read(
  inventoryId,
  managedServiceId
) {
  const response = await apiClient.get(
    `${inventoryRoute(inventoryId)}/${managedServiceId}`
  );

  return response.data.data;
}

export async function managed_service_create(
  inventoryId,
  data
) {
  const response = await apiClient.post(
    inventoryRoute(inventoryId),
    normalizePayload(data)
  );

  return response.data;
}

export async function managed_service_update(
  inventoryId,
  managedServiceId,
  data
) {
  const payload = {};

  if (data.service_name !== undefined) {
    payload.service_name =
      data.service_name.trim();
  }

  if (data.can_start !== undefined) {
    payload.can_start =
      Boolean(data.can_start);
  }

  if (data.can_stop !== undefined) {
    payload.can_stop =
      Boolean(data.can_stop);
  }

  if (data.can_restart !== undefined) {
    payload.can_restart =
      Boolean(data.can_restart);
  }

  if (data.can_enable !== undefined) {
    payload.can_enable =
      Boolean(data.can_enable);
  }

  if (data.can_disable !== undefined) {
    payload.can_disable =
      Boolean(data.can_disable);
  }

  if (data.remarks !== undefined) {
    payload.remarks =
      data.remarks?.trim() || null;
  }

  if (data.tags !== undefined) {
    payload.tags = Array.isArray(data.tags)
      ? data.tags
      : [];
  }

  const response = await apiClient.put(
    `${inventoryRoute(inventoryId)}/${managedServiceId}`,
    payload
  );

  return response.data;
}

export async function managed_service_delete(
  inventoryId,
  managedServiceId
) {
  const response = await apiClient.delete(
    `${inventoryRoute(inventoryId)}/${managedServiceId}`
  );

  return response.data;
}

export async function managed_service_set_status(
  inventoryId,
  managedServiceId,
  enabled
) {
  const action = enabled
    ? "enable"
    : "disable";

  const response = await apiClient.put(
    `${inventoryRoute(inventoryId)}/${managedServiceId}/${action}`
  );

  return response.data;
}