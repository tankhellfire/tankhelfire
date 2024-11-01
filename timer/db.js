class db {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    return (async () => {
      await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "key" });
          }
        };

        request.onsuccess = (event) => {
          this.dbInstance = event.target.result;
          resolve(this);
        };

        request.onerror = (event) => {
          reject(`Database error: ${event.target.errorCode}`);
        };
      });
      return this;
    })();
  }

  async set(key, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ data, key: key });

      request.onsuccess = () =>
        resolve(`Data written successfully for key ${key}`);
      request.onerror = (event) =>
        reject(`Write error: ${event.target.errorCode}`);
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readonly"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (event) => {
        if (event.target.result == undefined) {
          resolve(undefined);
          return;
        }
        resolve(event.target.result.data);
      };
      request.onerror = (event) =>
        reject(`Read error: ${event.target.errorCode}`);
    });
  }

  async keys() {
    return new Promise((resolve, reject) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readonly"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) =>
        reject(`Keys retrieval error: ${event.target.errorCode}`);
    });
  }

  async del(...key) {
    return new Promise((resolve, reject) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () =>
        resolve(`Data deleted successfully for key ${key}`);
      request.onerror = (event) =>
        reject(`Delete error: ${event.target.errorCode}`);
    });
  }
}
