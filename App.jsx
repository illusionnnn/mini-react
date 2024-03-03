import React from './src/core/React.js'

let countFoo = 1
function Foo () {
    console.log('Foo render')

    let update = React.update()
    function handleClick () {
        countFoo++
        update()
    }

    return (
        <div>
            foo: { countFoo }
            <button onClick={ handleClick }>click</button>
        </div>
    )
}

let countBar = 1
function Bar () {
    console.log('Bar render')

    let update = React.update()
    function handleClick () {
        countBar++
        update()
    }

    return (
        <div>
            bar: { countBar }
            <button onClick={ handleClick }>click</button>
        </div>
    )
}

let countContainer = 1
function Container () {
    console.log('Container render')

    let update = React.update()
    function handleClick () {
        countContainer++
        update()
    }

    return (
        <div>
            container: { countContainer }
            <button onClick={ handleClick }>button</button>
            <Bar></Bar>
            <Foo></Foo>
        </div>
    )
}

const App = (
    <div>
        app
        <Container></Container>
    </div>
)

export default App