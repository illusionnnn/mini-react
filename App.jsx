import React from './src/core/React.js'

function Foo () {
    const [count, setCount] = React.useState(10)
    const [count2, setCount2] = React.useState('bar')

    function handleClick () {
        setCount(c => c + 1)
        setCount2('bar')
    }

    React.useEffect(() => {
        return () => {
            console.log('init clean')
        }
    }, [])

    React.useEffect(() => {
        return () => {
            console.log('update clean')
        }
    }, [count])

    return (
        <div>
            <div>foo: { count }</div>
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