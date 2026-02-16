import React from "react";

const RiskCard = ({ title, value, level }) => {
  return (
    <div style={{
      padding: "15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      width: "200px"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{level}</p>
    </div>
  );
};

export default RiskCard;
