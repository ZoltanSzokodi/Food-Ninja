// real time listener - whenever there is a change in our db this method takes a snapshot and sends it to our listener
db.collection('recipes').onSnapshot(snapshot => {
  // console.log(snapshot.docChanges())
  snapshot.docChanges().forEach(change => {
    // console.log(change, change.doc.data(), change.doc.id)
    if (change.type === 'added') {
      // add the document data to the ui
    }
    if (change.type === 'removed') {
      // remove the document data from the ui
    }
  })
})
