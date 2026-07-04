/**
 * Local storage for design textures.
 * Saves as textura_<projectName>.<ext> in IndexedDB.
 */

const DB_NAME = "buxxep-textures";
const DB_VERSION = 1;
const STORE_NAME = "textures";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });
}

/** Generate storage key: textura_<projectName>.<ext> */
export function getTextureKey(projectName: string, extension: string): string {
  const safe =
    projectName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "proyecto";
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `textura_${safe}${ext}`;
}

export interface StoredTexture {
  key: string;
  blob: Blob;
  mimeType: string;
}

export async function saveTexture(
  projectName: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const key = getTextureKey(projectName, ext);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const record: StoredTexture = { key, blob: file, mimeType: file.type };
    const req = store.put(record);
    req.onsuccess = () => {
      db.close();
      resolve(URL.createObjectURL(file));
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function loadTexture(projectName: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const keys = store.getAllKeys();
    keys.onsuccess = () => {
      const keyList = keys.result as string[];
      const safe =
        projectName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "proyecto";
      const match = keyList.find((k) => k.startsWith(`textura_${safe}`));
      if (!match) {
        db.close();
        resolve(null);
        return;
      }
      const get = store.get(match);
      get.onsuccess = () => {
        const rec = get.result as StoredTexture | undefined;
        db.close();
        if (rec?.blob) {
          resolve(URL.createObjectURL(rec.blob));
        } else {
          resolve(null);
        }
      };
      get.onerror = () => {
        db.close();
        reject(get.error);
      };
    };
    keys.onerror = () => {
      db.close();
      reject(keys.error);
    };
  });
}

export async function loadTextureByKey(key: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => {
      const rec = req.result as StoredTexture | undefined;
      db.close();
      if (rec?.blob) {
        resolve(URL.createObjectURL(rec.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function deleteTexture(projectName: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      const keys = req.result as string[];
      const safe =
        projectName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "proyecto";
      const prefix = `textura_${safe}`;
      const match = keys.find((k) => k.startsWith(prefix));
      if (match) store.delete(match);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function listTextureKeys(): Promise<string[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      db.close();
      resolve(req.result as string[]);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

/**
 * Get the stored texture as a blob and filename for export/download.
 * Returns null if no texture is stored for this project.
 */
export async function getTextureForExport(
  projectName: string,
): Promise<{ blob: Blob; filename: string } | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const keys = store.getAllKeys();
    keys.onsuccess = () => {
      const keyList = keys.result as string[];
      const safe =
        projectName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "proyecto";
      const match = keyList.find((k) => k.startsWith(`textura_${safe}`));
      if (!match) {
        db.close();
        resolve(null);
        return;
      }
      const get = store.get(match);
      get.onsuccess = () => {
        const rec = get.result as StoredTexture | undefined;
        db.close();
        if (rec?.blob) {
          resolve({ blob: rec.blob, filename: rec.key });
        } else {
          resolve(null);
        }
      };
      get.onerror = () => {
        db.close();
        reject(get.error);
      };
    };
    keys.onerror = () => {
      db.close();
      reject(keys.error);
    };
  });
}
