import { apiClient } from "./client";

const route = inventoryId =>
  `/inventories/${inventoryId}/processes`;

export async function process_list(inventoryId) {
  const response = await apiClient.get(
    route(inventoryId)
  );

  return response.data;
}

export async function process_read(
  inventoryId,
  pid
) {
  const response = await apiClient.get(
    `${route(inventoryId)}/${pid}`
  );

  return response.data;
}

export async function process_action(
  inventoryId,
  pid,
  action,
  reason
) {
  const endpoint =
    action === "force_kill"
      ? "kill"
      : "terminate";

  const response = await apiClient.post(
    `${route(inventoryId)}/${pid}/${endpoint}`,
    {
      confirm_pid: pid,
      reason,
    }
  );

  return response.data;
}