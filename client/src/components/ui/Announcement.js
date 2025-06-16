import React from 'react';

const Announcement = ({ message }) => {
  return (
    <div style={{ 
      backgroundColor: '#e0f7fa', 
      padding: '15px', 
      borderRadius: '10px', 
      marginBottom: '20px',
      fontSize: '14px'
    }}>
      <span style={{ fontWeight: 'bold' }}>Information du 20 mars : </span>
      {message || "Aujourd'hui, nous souhaitons un bon anniversaire à Delphine, Xavier et Matthieu! 🎉"}
    </div>
  );
};

export default Announcement;
