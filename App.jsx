import React from './src/core/React.js'

function handleClick () {
    console.log(1)
}

function Counter ({ num }) {
    return <div>
            counter: { num }
            <button onClick={handleClick}>button</button>
        </div>
}

const App = (
    <div>
        app
        <Counter num={10}></Counter>
    </div>
)

export default App