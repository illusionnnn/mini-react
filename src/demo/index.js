let _taskId = 1

function workloop (deadLine) {
    _taskId++

    let shouldYield = false
    while (!shouldYield) {
        // dom render
        console.log(`_taskId: ${_taskId} run task`)
        shouldYield = deadLine.timeRemaining() < 1
    }

    requestIdleCallback(workloop)
}

requestIdleCallback(workloop)