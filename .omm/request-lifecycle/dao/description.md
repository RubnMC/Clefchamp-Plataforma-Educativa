DAO instance shared within each router module. Gets a connection from the pool, executes a parameterized SQL query, releases the connection, and invokes a Node.js-style callback with (err, result).
