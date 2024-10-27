class db {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.dbInstance = null;

        // Immediately open the database upon instantiation
        return (async () => {
            await new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id" });
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

    async write(key, data) {
        if (!this.dbInstance) throw new Error("Database is not open.");

        return new Promise((resolve, reject) => {
            const transaction = this.dbInstance.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ ...data, id: key });

            request.onsuccess = () => resolve(`Data written successfully for key ${key}`);
            request.onerror = (event) => reject(`Write error: ${event.target.errorCode}`);
        });
    }

    async read(key) {
        if (!this.dbInstance) throw new Error("Database is not open.");

        return new Promise((resolve, reject) => {
            const transaction = this.dbInstance.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = (event) => resolve(event.target.result || null);
            request.onerror = (event) => reject(`Read error: ${event.target.errorCode}`);
        });
    }
}
