/**
 * IndexedDB Cache Utility
 * Cung cấp cache lớn hơn localStorage với khả năng lưu trữ dữ liệu lớn
 * Hỗ trợ expiry time và tự động cleanup
 */

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiry: number; // milliseconds
}

class IndexedDBCache {
  private dbName = "campusconnect-cache";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Lưu data vào cache
   * @param key - Key để lưu cache
   * @param data - Data cần lưu
   * @param expiry - Thời gian hết hạn (ms), mặc định 24 giờ
   */
  async set<T>(key: string, data: T, expiry: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiry,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Lấy data từ cache
   * @param key - Key để lấy cache
   * @returns Data hoặc null nếu không tìm thấy hoặc đã hết hạn
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiry
        if (Date.now() - entry.timestamp > entry.expiry) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  }

  /**
   * Xóa một key khỏi cache
   * @param key - Key cần xóa
   */
  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Xóa tất cả cache
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const cache = new IndexedDBCache();

