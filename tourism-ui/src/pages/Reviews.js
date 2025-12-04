import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filterPlace, setFilterPlace] = useState("");

  // LIVE DATA LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(data);
    });

    return () => unsubscribe();
  }, []);

  // ADD REVIEW
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !comment || !placeName) return;

    await addDoc(collection(db, "reviews"), {
      userName,
      comment,
      placeName,
      createdAt: serverTimestamp(),
    });

    setUserName("");
    setComment("");
    setPlaceName("");
  };

  // FILTER (WHERE query)
  const handleFilter = async () => {
    if (!filterPlace) return;

    const q = query(
      collection(db, "reviews"),
      where("placeName", "==", filterPlace)
    );

    const snapshot = await getDocs(q);
    const filteredData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setReviews(filteredData);
  };

  // DELETE
  const deleteReview = async (id) => {
    await deleteDoc(doc(db, "reviews", id));
  };

  // UPDATE
  const startEdit = (review) => {
    setEditingId(review.id);
    setEditText(review.comment);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    await updateDoc(doc(db, "reviews", editingId), {
      comment: editText,
    });

    setEditingId(null);
    setEditText("");
  };

  return (
    <div>
      <h2>Firestore Reviews (NoSQL)</h2>

      {/* ADD FORM */}
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label">Your Name</label>
          <input
            className="form-control"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Place Name</label>
          <input
            className="form-control"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Comment</label>
          <textarea
            className="form-control"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button className="btn btn-success mt-2">Add Review</button>
      </form>

      <hr />

      {/* FILTER SECTION */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Filter by place (ex: Hampi)"
          value={filterPlace}
          onChange={(e) => setFilterPlace(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleFilter}>
          Filter
        </button>
      </div>

      {/* REVIEWS LIST */}
      <h4>Reviews</h4>
      <ul className="list-group">
        {reviews.map((r) => (
          <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{r.placeName}</strong> — 
              {editingId === r.id ? (
                <input
                  className="form-control mt-2"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <> {r.comment} </>
              )}
              <div className="text-muted">({r.userName})</div>
            </div>

            <div className="d-flex gap-2">
              {editingId === r.id ? (
                <button className="btn btn-success btn-sm" onClick={saveEdit}>
                  Save
                </button>
              ) : (
                <button className="btn btn-warning btn-sm" onClick={() => startEdit(r)}>
                  Edit
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
