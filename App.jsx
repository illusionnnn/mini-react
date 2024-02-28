import React from './src/core/React.js'

function Counter ({ num }) {
    return <div>counter: { num }</div>
}

const App = (
    <div>
        app
        <Counter num={10}></Counter>
        <Counter num={20}></Counter>
    </div>
)

export default App