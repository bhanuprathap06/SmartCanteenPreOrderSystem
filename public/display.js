let previousReady = []

async function loadReadyOrders(){
  try {

    const res    = await fetch("/orders")
    const orders = await res.json()
    const ready  = orders.filter(o => o.status === "Ready")

    const board     = document.getElementById("readyBoard")
    const emptyMsg  = document.getElementById("emptyBoard")

    board.innerHTML = ""

    if(ready.length === 0){
      emptyMsg.style.display = "block"
      return
    }

    emptyMsg.style.display = "none"

    ready.forEach(o => {
      const isNew = !previousReady.includes(o._id)

      const div = document.createElement("div")
      div.className = "readyToken" + (isNew ? " new-token" : "")
      div.innerText = "#" + o.token
      board.appendChild(div)
    })

    previousReady = ready.map(o => o._id)

  } catch(err){
    console.error("Display error:", err)
  }
}

setInterval(loadReadyOrders, 2000)
loadReadyOrders()