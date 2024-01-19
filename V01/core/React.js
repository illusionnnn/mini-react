function createTextNode (text) {
    return {
        type: 'text',
        props: {
            nodeValue: text
        },
        children: []
    }
}

function createElement (type, props, ...children) {
    return {
        type: type,
        props: { ...props },
        children: children.map(child => {
            return typeof child === 'string' ? createTextNode(child) : child
        })
    }
}

function render (el, container) {
    const dom = el.type !== 'text'
        ? document.createElement(el.type)
        : document.createTextNode('')
    
    Object.keys(el.props).forEach(prop => {
        if (prop !== 'children') {
            dom[prop] = el.props[prop]
        }
    })

    el.children.forEach(child => {
        render(child, dom)
    })

    container.append(dom)
}

export default {
    render,
    createElement
}