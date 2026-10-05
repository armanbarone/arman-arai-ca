"use client";
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("aa-wedding-preview-images", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("images");
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
export async function previewImage(id: string, file?: Blob): Promise<Blob | undefined> {
  const db = await database();
  try { return await new Promise<Blob | undefined>((resolve, reject) => { const tx = db.transaction("images", file ? "readwrite" : "readonly"), store = tx.objectStore("images"), request = file ? store.put(file, id) : store.get(id); let result: Blob | undefined; request.onsuccess = () => { result = file || request.result; }; tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error); }); }
  finally { db.close(); }
}
