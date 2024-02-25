function createTextNode (text) {
    return {
        type: 'text',
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function createElement (type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child === 'string' ? createTextNode(child) : child
            })
        },
        
    }
}

function createDom (type) {
    return type !== 'text'
        ? document.createElement(type)
        : document.createTextNode('')
}

function updateProps (dom, props) {
    Object.keys(props).forEach(prop => {
        if (prop !== 'children') {
            dom[prop] = props[prop]
        }
    })
}

function convertChildrenToLink (fiber) {
    const children = fiber.props.children
    let prevChild = null
    children.forEach((child, idx) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: null,
        }

        if (idx === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        prevChild = newFiber
    })
}

function performWorkOfUnit (fiber) {
    // not a first render
    if (!fiber.dom) {
        const dom = fiber.dom = createDom(fiber.type)
    
        updateProps(dom, fiber.props)
    }

    convertChildrenToLink(fiber)

    if (fiber.child) {
        return fiber.child
    }

    if (fiber.sibling) {
        return fiber.sibling
    }

    return fiber.parent?.sibling
}

function commitRoot (fiber) {
    commitFiber(fiber.child)
    // only calling commitRoot once
    root = null
}

function commitFiber (fiber) {
    if (!fiber) return

    fiber.parent.dom.append(fiber.dom)
    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}

let root = null
let nextWork = null
function workloop (deadLine) {
    let shouldYield = false
    while (!shouldYield && nextWork) {
        // dom render
        nextWork = performWorkOfUnit(nextWork)
        shouldYield = deadLine.timeRemaining() < 1
    }

    // unified submission to dom
    if (!nextWork && root) {
        commitRoot(root)
    }

    requestIdleCallback(workloop)
}
requestIdleCallback(workloop)

function render (el, container) {
    nextWork = {
        dom: container,
        props: {
            children: [el],
        }
    }
    root = nextWork
}

export default {
    render,
    createElement
}