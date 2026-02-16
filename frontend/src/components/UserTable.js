import React from "react";

const UserTable = ({ users }) => {
  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Score</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u._id}>
            <td>{u.user?.name}</td>
            <td>{u.user?.email}</td>
            <td>{u.score}</td>
            <td>{u.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;