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

export default function Reviews({ user }) {   // <-- now receiving logged-in user
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [rating, setRating] = useState(5);

  const sqlUserId = user?.user_id;  // <-- real user ID

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
    if (!user) {
      alert("Login required to add review.");
      return;
    }

    if (!comment || !placeName) return;

    await addDoc(collection(db, "reviews"), {
      userId: sqlUserId,     // <-- track owner
      userName: user.full_name,
      placeName,
      rating,
      comment,
      createdAt: serverTimestamp(),
    });

    setComment("");
    setPlaceName("");
  };

  // FILTER
  const handleFilter = async () => {
    if (!filterPlace) return;

    const q = query(
      collection(db, "reviews"),
      where("placeName", "==", filterPlace)
    );

    const snapshot = await getDocs(q);
    setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // DELETE
  const deleteReview = async (id) => {
    await deleteDoc(doc(db, "reviews", id));
  };

  // EDIT
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
      <h2>Reviews (Firestore - NoSQL)</h2>

      {/* ADD REVIEW FORM */}
      {user && (
        <form className="mt-3" onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            placeholder="Place Name"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />

          <textarea
            className="form-control mb-2"
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <input
            type="number"
            min="1"
            max="5"
            className="form-control mb-2"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <button className="btn btn-success">Add Review</button>
        </form>
      )}

      <hr />

      {/* FILTER */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Filter by place (e.g. Hampi)"
          value={filterPlace}
          onChange={(e) => setFilterPlace(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleFilter}>
          Filter
        </button>
      </div>

      {/* LIST */}
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
              <div className="text-muted">({r.userName}) ⭐ {r.rating}</div>
            </div>

            {/* 👇 Only show edit/delete if current user owns the review */}
            {r.userId === sqlUserId && (
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
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
