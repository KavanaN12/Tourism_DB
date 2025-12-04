import { useEffect, useState } from "react";
import axios from "axios";

export default function Places() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/places")
      .then(res => setPlaces(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <h2>Tourist Places</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {places.map(p => (
            <tr key={p.place_id}>
              <td>{p.place_name}</td>
              <td>{p.category}</td>
              <td>{p.state_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
