import React, {useEffect, useState} from "react";
import api from "../services/api";
import { use } from "react";

const AdminDashboard = () => {
    const [riskUsers, setRiskUsers] = useState([]);

    useEffect(() => {
        const fetchRisks = async () => {
            const { data } = await api.get("/detection/all");
            setRiskUsers(data);
        };
        fetchRisks();
    }, []);

    return (
        <div style ={{ padding: "20px" }}>
            <h2>🛡 Fake Profile Detection Dashboard</h2>

            
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Score</th>
            <th>Level</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {riskUsers.map(item => (
            <tr key={item._id}>
              <td>{item.user?.name}</td>
              <td>{item.user?.email}</td>
              <td>{item.score}</td>
              <td>{item.level}</td>
              <td>
                {item.level === "FAKE" && "🔴 Fake"}
                {item.level === "SUSPICIOUS" && "🟡 Suspicious"}
                {item.level === "GENUINE" && "🟢 Genuine"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;