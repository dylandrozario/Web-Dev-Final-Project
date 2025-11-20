import React from 'react';

export default function BookAvailability({ book }) {
    return (
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Availability</th>
            <th>Library</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {book.availability.map((item, index) => (
            <tr key={index}>
              <td>
              <button
                  style={{
                    backgroundColor: item.available > 0 ? "#28a745" : "#f8d7da", // green for checkout, faint red for request
                    color: item.available > 0 ? "white" : "#721c24", // white text on green, dark red text on light red
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  {item.available > 0 ? "CHECKOUT" : "REQUEST"}
                </button>
              </td>
              <td>{item.available} / {item.quantity}</td>
              <td>{item.library}</td>
              <td>{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

