# Backend
## Auth
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LOGIN**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/auth/    |  [JSON](#login) |
>|   **LOGIN**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/auth/login    |  [JSON](#login) |
>|   **REGISTER**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/auth/register    |  [JSON](#createupdateset-remarksset-tags) |
>|   **FORGOT PASSWORD**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/auth/forgot-password    |  [JSON](#.) |
>|   **RESET PASSWORD**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/auth/reset-password    |  [JSON](#.) |



## User
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/users    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/users/4    |  None |
>|   **CREATE**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/users    | [JSON](#createupdateset-remarksset-tags) |
>|   **UPDATE**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/users/4    | [JSON](#createupdateset-remarksset-tags) |
>|   **ENABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/users/4/enable    |   None |
>|   **DISABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/users/4/disable    |  None |
>|   **SET REMARKS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/users/4/remarks   | [JSON](#createupdateset-remarksset-tags) |
>|   **SET TAGS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/users/4/tags    | [JSON](#createupdateset-remarksset-tags) |
>|   **DELETE**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/users/4    |  None |
>|   **REMOVE REMARKS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/users/4/remarks/remove    |  None |
>|   **REMOVE TAGS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/users/4/tags/remove    |  None |


## User Role
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/user-roles    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/user-roles/3    |  None |
>|   **CREATE**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/user-roles    | [JSON](#createupdate-user-role) |
>|   **UPDATE**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/user-roles/3    | [JSON](#createupdate-user-role) |
>|   **ENABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/user-roles/3/enable    |   None |
>|   **DISABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/user-roles/3/disable    |  None |
>|   **SET REMARKS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/user-roles/3/remarks   | [JSON](#createupdate-user-role) |
>|   **SET TAGS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/user-roles/3/tags    | [JSON](#createupdate-user-role) |
>|   **DELETE**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/user-roles/3    |  None |
>|   **REMOVE REMARKS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/user-roles/3/remarks/remove    |  None |
>|   **REMOVE TAGS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/user-roles/3/tags/remove    |  None |



## Inventory
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/inventories    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1    |  None |
>|   **CREATE**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/inventories    | [JSON](#createupdate-inventory) |
>|   **UPDATE**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/inventories/1    | [JSON](#createupdate-inventory) |
>|   **ENABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/inventories/1/enable    |   None |
>|   **DISABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/inventories/1/disable    |  None |
>|   **SET REMARKS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/inventories/1/remarks   | [JSON](#createupdate-inventory) |
>|   **SET TAGS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/inventories/1/tags    | [JSON](#createupdate-inventory) |
>|   **DELETE**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/inventories/1    |  None |
>|   **REMOVE REMARKS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/inventories/1/remarks/remove    |  None |
>|   **REMOVE TAGS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/inventories/1/tags/remove    |  None |



# JSON:
## Create/Update/Set Remarks/Set Tags
```
{
    "userid": "testuser",
    "email": "seconduser@gmail.com",
    "password": "abc123",
    "confirm_password": "abc123",
    "name": "Sazad Ahemad",
    "remarks": "Testign auth",
    "user_role_id": 2,
    "tags": [
        "test", "auth", "user"
    ]
}
```
## Login
```
{
    "userid": "connect2sazad",
    "password": "abc123"
}
```
## Create/Update User Role
```
{
    "name": "Test Role",
    "slug": "test-role",
    "permissions": [
        "users.view",
        "users.create",
        "users.update",
        "users.delete",
        "user-roles.view",
        "user-roles.create",
        "user-roles.update",
        "user-roles.delete"
    ]
}
```
## Create/Update Inventory
```
{
    "name": "Instance",
    "hostname": "49.261.23.35",
    "ssh_port": 22,
    "ssh_username": "ubuntu",
    "environment": "production",
    "operating_system": "Ubuntu 22.04",
    "description": "Test Instance"
}



> ### MD Guide:
> https://www.markdownguide.org/basic-syntax/
---
> ### Generate Secret Key
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"