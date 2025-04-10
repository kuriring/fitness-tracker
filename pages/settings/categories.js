import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EmojiPicker from "emoji-picker-react";

export default function CategoryManager() {
  const [type, setType] = useState("expense");
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [newCat, setNewCat] = useState({ name: "", icon: "", color: "#888888" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "settings", "global");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCategories(data.categories || { income: [], expense: [] });
      }
    };
    fetchData();
  }, []);

  const updateFirestore = async (updated) => {
    await updateDoc(doc(db, "settings", "global"), {
      categories: updated,
    });
  };

  const handleAdd = async () => {
    if (!newCat.name.trim()) return;
  
    const isDuplicate = categories[type].some((c) => c.name === newCat.name);
    if (isDuplicate) {
      alert("❌ 이미 존재하는 카테고리 이름입니다!");
      return;
    }
  
    const updated = {
      ...categories,
      [type]: [...categories[type], newCat],
    };
    setCategories(updated);
    setNewCat({ name: "", icon: "", color: "#888888" });
    await updateFirestore(updated);
  };

  const handleDelete = async (nameToDelete) => {
    const updated = {
      ...categories,
      [type]: categories[type].filter((c) => c.name !== nameToDelete),
    };
    setCategories(updated);
    await updateFirestore(updated);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(categories[type]);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updated = {
      ...categories,
      [type]: reordered,
    };
    setCategories(updated);
    await updateFirestore(updated);
  };
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>📂 카테고리 관리</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setType("expense")}
          style={{
            flex: 1,
            backgroundColor: type === "expense" ? "#f44336" : "#eee",
            color: type === "expense" ? "#fff" : "#333",
            padding: "8px",
            borderRadius: "5px",
            border: "none",
          }}
        >
          지출
        </button>
        <button
          onClick={() => setType("income")}
          style={{
            flex: 1,
            backgroundColor: type === "income" ? "#4caf50" : "#eee",
            color: type === "income" ? "#fff" : "#333",
            padding: "8px",
            borderRadius: "5px",
            border: "none",
          }}
        >
          수입
        </button>
      </div>

      {/* ✅ 드래그 가능한 카테고리 목록 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categoryList">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ listStyle: "none", padding: 0 }}
            >
              {(categories[type] || []).map((cat, index) => (
                <Draggable key={cat.name} draggableId={cat.name} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        backgroundColor: "#f0f0f0",
                        marginBottom: "6px",
                        borderLeft: `6px solid ${cat.color}`,
                        borderRadius: "6px",
                        cursor: "grab",
                      }}
                    >
                      <span>
                        <span style={{ marginRight: "8px" }}>{cat.icon}</span>
                        {cat.name}
                      </span>
                      <button
                        onClick={() => handleDelete(cat.name)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                        }}
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

      {/* ✅ 새 카테고리 추가 */}
      <div style={{ marginTop: "30px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <h4>➕ 새 카테고리 추가</h4>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
          <input
            placeholder="이름"
            value={newCat.name}
            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
            style={{ flex: 2, padding: "6px" }}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{ padding: "6px 10px", fontSize: "18px" }}
          >
            {newCat.icon || "😀"}
          </button>
          <input
            type="color"
            value={newCat.color}
            onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
            style={{ width: "40px", height: "40px", border: "none", background: "none" }}
          />
        </div>

        {showEmojiPicker && (
          <div style={{ marginBottom: "10px" }}>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setNewCat({ ...newCat, icon: emojiData.emoji });
                setShowEmojiPicker(false);
              }}
              height={350}
            />
          </div>
        )}

        <button
          onClick={handleAdd}
          style={{
            padding: "8px 12px",
            borderRadius: "5px",
            backgroundColor: "#2196f3",
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