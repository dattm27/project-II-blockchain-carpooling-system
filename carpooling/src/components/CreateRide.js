import React, { useState } from 'react';

function CreateRide() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [fare, setFare] = useState('');
  const [startTime, setStartTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Gửi thông tin chuyến đi đến smart contract
  };

  return (
    <div>
      <h2>Create Ride</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Start Point:
          <input type="text" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} />
        </label>
        <label>
          End Point:
          <input type="text" value={endPoint} onChange={(e) => setEndPoint(e.target.value)} />
        </label>
        <label>
          Fare:
          <input type="number" value={fare} onChange={(e) => setFare(e.target.value)} />
        </label>
        <label>
          Start Time:
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <button type="submit">Create Ride</button>
      </form>
    </div>
  );
}

export default CreateRide;