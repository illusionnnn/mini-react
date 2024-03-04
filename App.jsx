import React from './src/core/React.js'

function Foo () {
    const [count, setCount] = React.useState(0)
    const [count2, setCount2] = React.useState('bar')

    function handleClick () {
        setCount(() => 10)
        setCount2(c => c + 'bar')
    }

    return (
        <div>
            <div>count: { count }</div>
            <div>count2: { count2 }</div>
            <button onClick={ handleClick }>click</button>
        </div>
    )
}

const App = (
    <div>
        app
        <Foo></Foo>
    </div>
)

export default App