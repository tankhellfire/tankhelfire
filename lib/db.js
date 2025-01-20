class Db {
  constructor(name, storeName) {
    this.name=name;
    this.storeName=storeName;
    return (async e=>{
      await new Promise((res, reject)=>{

        let req=indexedDB.open(name, 1);

        req.onupgradeneeded = (event) => {
          let db = event.target.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "key" });
          }
        };

        req.onsuccess = (event) => {
          this.dbInstance = event.target.result;
          resolve(this);
        };

        req.onerror = (event) => {
          reject(`Database error: ${event.target.errorCode}`);
        };
      });
      return this
    })();
  }

  set(key, data) {
    return new Promise((res, rej) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ data, key: key });

      request.onsuccess = () =>
        res(`Data written successfully for key ${key}`);
      request.onerror = (e) =>{
        console.error(e)
        rej(`Write error: ${e.target.errorCode}`)
      };
    });
  }

  get(key) {
    return new Promise((res, rej) => {
      const transaction = this.dbInstance.transaction(
        this.storeName,
        "readonly"
      );
      const store = transaction.objectStore(this.storeName);
      const req = store.get(key);

      req.onsuccess = e => {
        res(e.target.result?.data);
      };
      req.onerror = e=>rej(`Read error: ${e.target.errorCode}`);
    });
  }

  async keys() {
    return new Promise((res, rej) => {
      let req=this.dbInstance.transaction(this.storeName,"readonly").objectStore(this.storeName).getAllKeys();
      
      req.onsuccess=e=>res(e.target.result);
      req.onerror=e=>rej(`Keys retrieval error: ${e.target.errorCode}`);
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      let req=this.dbInstance.transaction(this.storeName,"readwrite").objectStore(this.storeName).delete(key);
      
      req.onsuccess=e=>res(`Data deleted successfully for key ${key}`);
      req.onerror=e=>rej(`Delete error: ${event.target.errorCode}`);
    });
  }
}
exports=Db