import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function PaymentManager() {
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "settings", "global");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPayments(Array.isArray(data.payments) ? data.payments : []);
      }
    };
    fetchData();
  }, []);

  const updateFirestore = async (updated) => {
    await updateDoc(doc(db, "settings", "global"), {
      payments: updated,
    });
  };

  const handleAdd = async () => {
    if (!newPayment.trim()) return;
    if (payments.includes(newPayment)) {
      alert("❌ 이미 존재하는 결제 수단입니다!");
      return;
    }
    const updated = [...payments, newPayment];
    setPayments(updated);
    setNewPayment("");
    await updateFirestore(updated);
  };

  const handleDelete = async (target) => {
    const updated = payments.filter((p) => p !== target);
    setPayments(updated);
    await updateFirestore(updated);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(payments);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setPayments(reordered);
    await updateFirestore(reordered);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h2>💳 결제 수단 관리</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="payments">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps} style={{ listStyle: "none", padding: 0 }}>
              {payments.map((p, index) => (
                <Draggable key={p} draggableId={p} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#f9f9f9",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "8px",
                        cursor: "grab",
                      }}
                    >
                      <span>{p}</span>
                      <button
                        onClick={() => handleDelete(p)}
                        style={{ background: "transparent", border: "none", color: "#999", cursor: "pointer" }}
                      >
                        🗑
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="새 결제 수단 입력"
          value={newPayment}
          onChange={(e) => setNewPayment(e.target.value)}
          style={{ padding: "8px", width: "70%", marginRight: "10px" }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px",
            borderRadius: "5px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
}