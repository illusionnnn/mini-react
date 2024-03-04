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

function updateProps (dom, nextProps, prevProps) {
    // 1. old has prop, but new does not
    Object.keys(prevProps).forEach(prop => {
        if (prop !== 'children') {
            if (!(prop in nextProps)) {
                dom.removeAttribute(prop)
            }
        }
    })

    // 2. new has prop, but old does not
    // 3. new has prop, but old does has
    Object.keys(nextProps).forEach(prop => {
        if (prop !== 'children') {
            if (nextProps[prop] !== prevProps[prop]) {
                if (prop.startsWith('on')) {
                    const eventType = prop.slice(2).toLocaleLowerCase()
                    dom.removeEventListener(eventType, prevProps[prop])
                    dom.addEventListener(eventType, nextProps[prop])
                } else {
                    dom[prop] = nextProps[prop]
                }
            }              
        }
    })
}

function reconcileChildren (fiber, children) {
    let oldChild = fiber.alternate?.child
    let prevChild = null

    children.forEach((child, idx) => {
        const isSameType = oldChild && oldChild.type === child.type

        let newFiber
        if (isSameType) {
            // update
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldChild.dom,
                effectTag: 'update',
                alternate: oldChild,
            }
        } else {
            // using boolean to return nodes
            if (child) {
                newFiber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber,
                    sibling: null,
                    dom: null,
                    effectTag: 'placement'
                }
            }

            // delete
            if (oldChild) {
                deletions.push(oldChild)
            }
        }

        if (oldChild) {
            oldChild = oldChild.sibling
        }

        if (idx === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        // using boolean to return nodes
        if (newFiber) {
            prevChild = newFiber
        }
    })

    // new is less than old
    while (oldChild) {
        deletions.push(oldChild)
        oldChild = oldChild.sibling
    }
}

function updateFunctionComponent (fiber) {
    // reset when rerender component
    stateHookIdx = 0
    stateHooks = []
    effectHooks = []
    wipFiber = fiber

    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent (fiber) {
    // not a first render
    if (!fiber.dom) {
        const dom = fiber.dom = createDom(fiber.type)
        updateProps(dom, fiber.props, {})
    }
    reconcileChildren(fiber, fiber.props.children)
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

function commitRoot () {
    deletions.forEach(commitDeletion)
    commitFiber(wipRoot.child)
    commitEffectHooks()
    // only calling commitRoot once
    wipRoot = null
    deletions = []
}

function commitFiber (fiber) {
    if (!fiber) return

    // function component and recursion nesting
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }

    if (fiber.effectTag === 'update') {
        updateProps(fiber.dom, fiber.props , fiber.alternate?.props)
    } else {
        fiber.dom && fiberParent.dom.append(fiber.dom)
    }

    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}

function commitDeletion (fiber) {
    if (fiber.dom) {
        let fiberParent = fiber.parent
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent
        }
        fiberParent.dom.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child)
    }
}

function commitEffectHooks () {
    function run (fiber) {
        if (!fiber) return

        // init
        if (!fiber.alternate) {
            fiber?.effectHooks?.forEach(hook => {
                hook.cleanup = hook.cb()
            })
        } else {
            // update
            const oldEffectHooks = fiber.alternate.effectHooks
            oldEffectHooks?.forEach((oldHook, idxOutter) => {
                const newHook = fiber?.effectHooks[idxOutter]
                const needUpdate = oldHook?.deps.some((dep, idxInner) => {
                    return dep !== newHook.deps[idxInner]
                })

                needUpdate && (newHook.cleanup = newHook?.cb())
            })
        }

        run(fiber.child)
        run(fiber.sibling)
    }

    function runCleanup (fiber) {
        if (!fiber) return

        fiber.alternate?.effectHooks?.forEach(hook => {
            if (hook.deps.length) {
                hook.cleanup && hook.cleanup()
            }
        })

        runCleanup(fiber.child)
        runCleanup(fiber.sibling)
    }
    runCleanup(wipFiber)

    run(wipFiber)
}

let wipRoot = null
let nextWork = null
let deletions = []
let wipFiber = null
function workloop (deadLine) {
    let shouldYield = false
    while (!shouldYield && nextWork) {
        // dom render
        nextWork = performWorkOfUnit(nextWork)

        if (wipRoot?.sibling?.type === nextWork?.type) {
            nextWork = undefined
        }

        shouldYield = deadLine.timeRemaining() < 1
    }

    // unified submission to dom
    if (!nextWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workloop)
}

function render (el, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [el],
        }
    }
    nextWork = wipRoot
}

function update () {
    let currentWipFiber = wipFiber

    // using clourse to save current function component
    return () => {
        wipRoot = {
            ...currentWipFiber,
            alternate: currentWipFiber,
        }
        nextWork = wipRoot
    }
}

let stateHookIdx
let stateHooks
function useState (initial) {
    let currentWipFiber = wipFiber
    const oldHook = currentWipFiber.alternate?.stateHooks[stateHookIdx]
    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : [],
    }

    stateHook.queue.forEach(action => {
        stateHook.state = action(stateHook.state)
    })
    stateHook.queue = []

    stateHooks.push(stateHook)
    stateHookIdx++
    currentWipFiber.stateHooks = stateHooks

    function setState (action) {
        // prevent re-render when the value remains unchanged
        const eagerState = typeof action === 'function' ? action(stateHook.state) : action
        if (eagerState === stateHook.state) return

        stateHook.queue.push(typeof action === 'function' ? action : () => action)

        wipRoot = {
            ...currentWipFiber,
            alternate: currentWipFiber,
        }
        nextWork = wipRoot
    }
    return [stateHook.state, setState]
}

let effectHooks
function useEffect (cb, deps) {
    const effectHook = {
        cb,
        deps,
        cleanup: undefined,
    }
    effectHooks.push(effectHook)
    wipFiber.effectHooks = effectHooks
}

requestIdleCallback(workloop)

export default {
    useState,
    useEffect,
    update,
    render,
    createElement,
}