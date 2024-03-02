import React from './src/core/React.js'

let count = 10
let props = { id: '111' }
function Counter () {
    function handleClick () {
        count++
        props = {}
        React.update()
    }

    return (
        <div { ...props }>
            counter: { count }
            <button onClick={ handleClick }>button</button>
        </div>
    )
}

const App = (
    <div>
        app
        <Counter></Counter>
    </div>
)

export default App