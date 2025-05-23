class Db{
  constructor(name,storeName){
    this.name=name;
    this.storeName=storeName;
    return new Promise((res,rej)=>{
      let req=indexedDB.open(name,1);

      req.onupgradeneeded=e=>{
        let db=e.target.result;
        if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName,{keyPath:"key"});
      };

      req.onsuccess=e=>{
        this.dbInstance=e.target.result;
        res(this);
      };

      req.onerror=e=>rej(`Database error:${e.target.errorCode}`)
    });
  }

  set(key,data){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readwrite").objectStore(this.storeName).put({data,key});

    req.onsuccess=e=>res(data)
    req.onerror=e=>rej(`Write error:${e.target.errorCode}`)
  })}

  get(key){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readonly").objectStore(this.storeName).get(key)

    req.onsuccess=e=>res(e.target.result?.data)
    req.onerror=e=>rej(`Read error:${e.target.errorCode}`)
  })}
  
  del(key){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readwrite").objectStore(this.storeName).delete(key);

    req.onsuccess=e=>res(1);
    req.onerror=e=>rej(`Delete error: ${event.target.errorCode}`);
  })}
  

  keys(){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readonly").objectStore(this.storeName).getAllKeys();

    req.onsuccess=e=>res(e.target.result);
    req.onerror=e=>rej(`Keys retrieval error:${e.target.errorCode}`);
  })}

}
exports=Db