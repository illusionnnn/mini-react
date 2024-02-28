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
                const isTextNode = typeof child === 'string' || typeof child === 'number'
                return isTextNode ? createTextNode(child) : child
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

function convertChildrenToLink (fiber, children) {
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

function updateFunctionComponent (fiber) {
    const children = [fiber.type(fiber.props)]
    convertChildrenToLink(fiber, children)
}

function updateHostComponent (fiber) {
    // not a first render
    if (!fiber.dom) {
        const dom = fiber.dom = createDom(fiber.type)
        updateProps(dom, fiber.props)
    }
    convertChildrenToLink(fiber, fiber.props.children)
}

function performWorkOfUnit (fiber) {
    const isFunctionComponent = typeof fiber.type === 'function'

    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    if (fiber.child) {
        return fiber.child
    }

    // multiple components at the same level 
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}

function commitRoot (fiber) {
    commitFiber(fiber.child)
    // only calling commitRoot once
    root = null
}

function commitFiber (fiber) {
    if (!fiber) return

    // function component and recursion nesting
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    fiber.dom && fiberParent.dom.append(fiber.dom)

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