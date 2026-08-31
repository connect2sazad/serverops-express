# Common

## Commands
<div style="border-left: 4px solid red; padding-left: 10px;">

|   Action     |    Command    |
|--------------|---------------|
|   **Generate Secret Key**    |   ```node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"```   |
|   **Generate Encryption Key**    |   ```node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"```   |
|   **Start Frontend**    |   ```cd frontend && npm run dev```   |
|   **Start Backend**    |   ```cd backend && npm run dev```   |
|   **Create Migration**    |   ```npx sequelize-cli migration:generate --name migration-file-name-here-in-this-format```   |
|   **Run Migration**    |   ```npx sequelize-cli db:migrate```   |
|   **Create Seed**    |   ``` npx sequelize-cli seed:generate --name seeding-file-name-here-in-this-format```   |
|   **Run Seeding**    |   ```npx sequelize-cli db:seed:all```   |

</div>


# Backend

## Home
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **HOME**    |   ``GET``   |   http://127.0.0.1:3100/    |  None |

## Health
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **HEALTH**    |   ``GET``   |   http://127.0.0.1:3100/health/    |  None |
>|   **READINESS** |   ``GET``   |   http://127.0.0.1:3100/health/ready    |  None |


## Auth
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LOGIN**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/auth/    |  [JSON](#login) |
>|   **LOGIN**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/auth/login    |  [JSON](#login) |
>|   **LOGOUT**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/auth/logout    |  None |
>|   **REGISTER**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/auth/register    |  [JSON](#createupdateset-remarksset-tags) |
>|   **FORGOT PASSWORD**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/auth/forgot-password    |  [JSON](#.) |
>|   **RESET PASSWORD**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/auth/reset-password    |  [JSON](#.) |



## User
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/users    |  None |
>|   **SELF VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/users/self    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/users/4    |  None |
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
>|   **ALL CREDENTIALS**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1/credentials    |  None |
>|   **HOST KEY**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1/host-key    |  None |
>|   **HOST KEY TRUST**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1/host-key/trust    |  None |
>|   **TEST CONNECTION**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1/test-connection    |  None |
>|   **DISCOVER**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/inventories/1/discover    |  None |
>|   **COMMAND**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/inventories/6/command    |  [JSON](#command) |

## Credentials
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/credentials    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/credentials/1    |  None |
>|   **CREATE**    |   ``POST``   |   http://127.0.0.1:3100/api/v1/credentials    | [JSON](#createupdate-credential) |
>|   **UPDATE**    |   ``PUT``    |   http://127.0.0.1:3100/api/v1/credentials/1    | [JSON](#createupdate-credential) |
>|   **ENABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/credentials/1/enable    |   None |
>|   **DISABLE**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/credentials/1/disable    |  None |
>|   **SET REMARKS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/credentials/1/remarks   | [JSON](#createupdate-credential) |
>|   **SET TAGS**    |   ``PUT``   |   http://127.0.0.1:3100/api/v1/credentials/1/tags    | [JSON](#createupdate-credential) |
>|   **DELETE**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/credentials/1    |  None |
>|   **REMOVE REMARKS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/credentials/1/remarks/remove    |  None |
>|   **REMOVE TAGS**    |   ``DELETE``   |   http://127.0.0.1:3100/api/v1/credentials/1/tags/remove    |  None |


## Command Executions
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/command-executions    |  None |
>|   **VIEW**    |   ``GET``   |   http://127.0.0.1:3100/api/v1/command-executions/1    |  None |

## Services
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/services    |  None |
>|   **VIEW**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/services/nginx    |  None |
>|   **START SERVICE**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/nginx/start    |  None |
>|   **STOP SERVICE**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/nginx/stop    |  None |
>|   **RESTART SERVICE**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/nginx/restart    |  None |
>|   **ENABLE SERVICE**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/nginx/enable    |  None |
>|   **DISABLE SERVICE**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/nginx/disable    |  None |

## Processes
>|   Action |    Request Type    |   Link    |   Request Body    |
>|----------|--------------------|-----------|-------------------|
>|   **LIST**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/processes    |  None |
>|   **VIEW**    |   ``GET``    |   http://127.0.0.1:3100/api/v1/processes/295    |  None |
>|   **TERMINATE PROCESS**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/295/terminate    |  None |
>|   **FORCE KILL PROCESS**    |   ``POST``    |   http://127.0.0.1:3100/api/v1/services/295/kill    |  None |


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
```
## Create/Update Credential
```
{
    "inventory_id": 1,
    "username": "ubuntu",
    "type": "password",
    "secret": "abc123"
}
```
## Command
```
{
    "command": "pwd"
}
```
---

> ### MD Guide:
> https://www.markdownguide.org/basic-syntax/
