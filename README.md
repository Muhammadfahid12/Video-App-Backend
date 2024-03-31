### JWT is bearer token.

### bcrypt library is used to hash and also compare current password with hash.


### logout process for JWT tokens

Yes, you're on the right track! Here's a simplified breakdown in point form:

1. **JWT (JSON Web Token) Authentication**:
    - When a client logs in, a JWT is created on the server and sent back to the client, typically stored in a cookie or local storage.
    - This JWT contains information about the user's authentication status and permissions.

2. **Client Requests**:
    - When the client makes subsequent requests to the server, it sends the JWT along with the request, typically in the `Authorization` header.

3. **Logout Process**:
    - To logout, the client sends a logout request to the server.
    - The server verifies the JWT sent by the client, ensuring it matches the JWT stored on the server.
    - If the JWT is valid and matches the server's record, the server invalidates the JWT.
    - This can involve deleting the JWT from the client's cookie or local storage and also marking it as invalid on the server.

4. **JWT Verification**:
    - The server should always verify the JWT sent by the client to ensure its authenticity and validity before processing any requests.

5. **Handling Invalid JWTs**:
    - If the JWT sent by the client is invalid or expired, the server should respond with an appropriate error message, indicating that the client needs to reauthenticate.

6. **Clearing Client-Side Tokens**:
    - After logout, the client should clear the JWT from its storage (e.g., cookies, local storage) to ensure that it can't be used for further requests.

By following this process, you can effectively handle logout functionality in a JWT-based authentication system, ensuring that clients are properly authenticated and their access tokens are securely managed.