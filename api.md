# GET
- List all users: http://127.0.0.1:3100/api/v1/users
- View a user: http://127.0.0.1:3100/api/v1/users/4

# PUT
- Update a user: http://127.0.0.1:3100/api/v1/users/4
- Add user remarks: http://127.0.0.1:3100/api/v1/users/4/remarks
- Add user tags: http://127.0.0.1:3100/api/v1/users/4/tags
- Enable a user: http://127.0.0.1:3100/api/v1/users/4/enable
- Disable a user: http://127.0.0.1:3100/api/v1/users/4/disable

# DELETE
- Delete a user: http://127.0.0.1:3100/api/v1/users/4
- Delete user remarks: http://127.0.0.1:3100/api/v1/users/4/remarks/remove
- Delete user tags: http://127.0.0.1:3100/api/v1/users/4/tags/remove

# POST
- Register a user: http://127.0.0.1:3100/api/v1/auth/register
- Login a user: http://127.0.0.1:3100/api/v1/auth/login
  
---
  
# JSON:
- Create/Update/Set Remarks/Set Tags
```
{
    "userid": "testuser",
    "email": "seconduser@gmail.com",
    "password": "abc123",
    "confirm_password": "abc123",
    "name": "Sazad Ahemad",
    "remarks": "Testign auth",
    "tags": [
        "test", "auth", "user"
    ]
}
```
- Login
```
{
    "userid": "connect2sazad",
    "password": "abc123"
}
```




> ## MD Guide:
> https://www.markdownguide.org/basic-syntax/