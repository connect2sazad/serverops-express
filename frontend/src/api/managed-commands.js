import { apiClient } from "./client";

const inventoryRoute = inventoryId =>
  `/inventories/${inventoryId}/managed-commands`;

function normalizeCreatePayload(data) {
  return {
    name: data.name.trim(),

    description:
      data.description?.trim() || null,

    command: data.command.trim(),

    timeout_seconds:
      Number(data.timeout_seconds),

    remarks:
      data.remarks?.trim() || null,

    tags: Array.isArray(data.tags)
      ? data.tags
      : [],
  };
}

export async function managed_command_list({
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

export async function managed_command_read(
  inventoryId,
  managedCommandId
) {
  const response = await apiClient.get(
    `${inventoryRoute(inventoryId)}/${managedCommandId}`
  );

  return response.data.data;
}

export async function managed_command_create(
  inventoryId,
  data
) {
  const response = await apiClient.post(
    inventoryRoute(inventoryId),
    normalizeCreatePayload(data)
  );

  return response.data;
}

export async function managed_command_update(
  inventoryId,
  managedCommandId,
  data
) {
  const payload = {};

  if (data.name !== undefined) {
    payload.name = data.name.trim();
  }

  if (data.description !== undefined) {
    payload.description =
      data.description?.trim() || null;
  }

  if (data.command !== undefined) {
    payload.command = data.command.trim();
  }

  if (data.timeout_seconds !== undefined) {
    payload.timeout_seconds =
      Number(data.timeout_seconds);
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
    `${inventoryRoute(inventoryId)}/${managedCommandId}`,
    payload
  );

  return response.data;
}

export async function managed_command_delete(
  inventoryId,
  managedCommandId
) {
  const response = await apiClient.delete(
    `${inventoryRoute(inventoryId)}/${managedCommandId}`
  );

  return response.data;
}

export async function managed_command_set_status(
  inventoryId,
  managedCommandId,
  enabled
) {
  const action = enabled
    ? "enable"
    : "disable";

  const response = await apiClient.put(
    `${inventoryRoute(inventoryId)}/${managedCommandId}/${action}`
  );

  return response.data;
}

export async function managed_command_execute(
  inventoryId,
  managedCommandId,
  reason
) {
  const response = await apiClient.post(
    `${inventoryRoute(inventoryId)}/${managedCommandId}/execute`,
    {
      reason: reason.trim(),
    }
  );

  return response.data;
}