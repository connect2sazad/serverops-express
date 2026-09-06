import { apiClient } from "./client";

const inventoryRoute = inventoryId =>
  `/inventories/${inventoryId}/services`;

export async function service_list(inventoryId) {
  const response = await apiClient.get(
    inventoryRoute(inventoryId)
  );

  return response.data;
}

export async function service_read(
  inventoryId,
  serviceName
) {
  const response = await apiClient.get(
    `${inventoryRoute(inventoryId)}/${encodeURIComponent(serviceName)}`
  );

  return response.data;
}

export async function service_action(
  inventoryId,
  serviceName,
  action,
  reason = null
) {
  const response = await apiClient.post(
    `${inventoryRoute(inventoryId)}/${encodeURIComponent(serviceName)}/${action}`,
    {
      reason: reason?.trim() || undefined,
    }
  );

  return response.data;
}