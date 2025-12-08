// Reviews.js (UPDATED)
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

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [rating, setRating] = useState(5);

  const sqlUserId = user?.user_id;

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(data);
    }, (err) => console.error("reviews snapshot err", err));

    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Login required to add review.");
      return;
    }
    if (!comment || !placeName) {
      alert("Place name and comment required.");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        userId: sqlUserId,
        userName: user.full_name,
        placeName,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      setComment("");
      setPlaceName("");
      setRating(5);
    } catch (err) {
      console.error("add review failed", err);
      alert("Failed to add review: " + err.message);
    }
  };

  const handleFilter = async () => {
    if (!filterPlace) {
      // reset to live listener behavior
      const allSnap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
      setReviews(allSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      return;
    }
    try {
      const q = query(collection(db, "reviews"), where("placeName", "==", filterPlace));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("filter error", err);
    }
  };

  const deleteReview = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (err) {
      console.error("delete review err", err);
      alert("Delete failed");
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditText(review.comment || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateDoc(doc(db, "reviews", editingId), { comment: editText });
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("save edit err", err);
    }
  };

  return (
    <div>
      <h2>Reviews (Firestore - NoSQL)</h2>
      {user && (
        <form className="mt-3" onSubmit={handleSubmit}>
          <input className="form-control mb-2" placeholder="Place Name" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          <textarea className="form-control mb-2" placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
          <input type="number" min="1" max="5" className="form-control mb-2" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          <button className="btn btn-success">Add Review</button>
        </form>
      )}

      <hr />
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Filter by place (e.g. Hampi)" value={filterPlace} onChange={(e) => setFilterPlace(e.target.value)} />
        <button className="btn btn-primary" onClick={handleFilter}>Filter</button>
        <button className="btn btn-secondary" onClick={() => { setFilterPlace(""); handleFilter(); }}>Reset</button>
      </div>

      <ul className="list-group">
        {reviews.map((r) => (
          <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{r.placeName}</strong> —
              {editingId === r.id ? (
                <input className="form-control mt-2" value={editText} onChange={(e) => setEditText(e.target.value)} />
              ) : (
                <> {r.comment} </>
              )}
              <div className="text-muted">({r.userName}) ⭐ {r.rating}</div>
            </div>

            {r.userId === sqlUserId && (
              <div className="d-flex gap-2">
                {editingId === r.id ? (
                  <button className="btn btn-success btn-sm" onClick={saveEdit}>Save</button>
                ) : (
                  <button className="btn btn-warning btn-sm" onClick={() => startEdit(r)}>Edit</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
